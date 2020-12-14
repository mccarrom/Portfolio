from google.cloud import datastore
from flask import Flask, request, make_response, render_template, Response
from requests_oauthlib import OAuth2Session
import json
from google.oauth2 import id_token
from google.auth import crypt
from google.auth import jwt
from google.auth.transport import requests

# This disables the requirement to use HTTPS so that you can test locally.
import os 
import constants
import flask
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
client = datastore.Client()

# These should be copied from an OAuth2 Credential section at
# https://console.cloud.google.com/apis/credentials
client_id = '774859019030-dkh87prkicnl14hmkc5i51662g8qcgf2.apps.googleusercontent.com'
client_secret = 'qF-yPFzNhO5qhtEy-ENgW-bK'

# This is the page that you will use to decode and collect the info from
# the Google authentication flow
redirect_uri = 'https://mccarrom-final.ue.r.appspot.com/oauth'

# These let us get basic info to identify a user and not much else
# they are part of the Google People API
scope = ['https://www.googleapis.com/auth/userinfo.profile',]
oauth = OAuth2Session(client_id, redirect_uri=redirect_uri,
                          scope=scope)

# This link will redirect users to begin the OAuth flow with Google
@app.route('/')
def index():
    authorization_url, state = oauth.authorization_url(
        'https://accounts.google.com/o/oauth2/auth',
        # access_type and prompt are Google specific extra
        # parameters.
        access_type="offline", prompt="select_account")
    return render_template("index.html", authURL=authorization_url)

# This is where users will be redirected back to and where you can collect
# the JWT for use in future requests
@app.route('/oauth')
def oauthroute():
    token = oauth.fetch_token(
        'https://accounts.google.com/o/oauth2/token',
        authorization_response=request.url,
        client_secret=client_secret)
    req = requests.Request()

    id_info = id_token.verify_oauth2_token( 
    token['id_token'], req, client_id)

    query = client.query(kind=constants.users)
    query.add_filter("userID", "=", id_info.get('sub'))
    userList = list(query.fetch())
    print(userList)

    if len(userList) > 0:
        return render_template("userInfo.html", JWT=token['id_token'], JWTsub=id_info.get('sub'), newUserCreated="false")
    else:
        createUsers(id_info.get('sub'))
        return render_template("userInfo.html", JWT=token['id_token'], JWTsub=id_info.get('sub'), newUserCreated="true")

def createUsers(userID):
    new_user = datastore.entity.Entity(key=client.key(constants.users))
    new_user.update({"userID": userID})
    client.put(new_user)
    new_user["id"] = new_user.key.id
    return(json.dumps(new_user))

@app.route('/users', methods=['GET'])
def getUsers():
    query = client.query(kind=constants.users)
    results = list(query.fetch())
    for e in results:
        e["id"] = e.key.id
    return (json.dumps(results), 200)

@app.route('/boats', methods=['POST'])
def createBoats():
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        if(authorizationHeader):
            if request.method == 'POST':
                content = request.get_json()
                if not(content) or len(content) < 3:
                    return(("There is something wrong with the request object"), 400)
                else:
                    new_boat = datastore.entity.Entity(key=client.key(constants.boats))
                    new_boat.update({"name": content["name"], "type": content["type"],
                                "length": content["length"], "owner" : id_info.get('sub')})
                    client.put(new_boat)
                    new_boat["id"] = new_boat.key.id
                    new_boat["self"] = "https://mccarrom-final.ue.r.appspot.com/boats/" + str(new_boat.key.id)
                    return (json.dumps(new_boat), 201)
            else:
                return_message = {"Error" : "That HTTP method is not recognized on this page"}
                return (json.dumps(return_message), 405)
    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)

@app.route('/boats', methods=['GET'])
def getAllBoats():
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        if(authorizationHeader):
            if request.method == 'GET':
                query = client.query(kind=constants.boats)
                query.add_filter("owner", "=", id_info.get('sub'))
                q_limit = int(request.args.get('limit', '5'))
                q_offset = int(request.args.get('offset', '0'))
                numberOfBoats=len(list(query.fetch()))
                l_iterator = query.fetch(limit= q_limit, offset=q_offset)
                pages = l_iterator.pages
                results = list(next(pages))
                if l_iterator.next_page_token:
                    next_offset = q_offset + q_limit
                    next_url = request.base_url + "?limit=" + str(q_limit) + "&offset=" + str(next_offset)
                else:
                    next_url = None
                for e in results:
                    e["id"] = e.key.id
                output = {"total boats": numberOfBoats, "boats": results}
                if next_url:
                    output["next"] = next_url
                return (json.dumps(output), 200)
            else:
                return_message = {"Error" : "That HTTP method is not recognized on this page"}
                return (json.dumps(return_message), 405)
    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)

@app.route('/boats/<boat_id>', methods=['GET'])
def getThisBoat(boat_id):
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        if(authorizationHeader):
            if request.method == 'GET':
                boat_key = client.key(constants.boats, int(boat_id))
                boat = client.get(key=boat_key)
                if boat and boat["owner"] == id_info.get('sub'):
                    boat["id"] = boat.key.id
                    boat["self"] = "https://mccarrom-final.ue.r.appspot.com/boats/" + str(boat.key.id)
                    return (json.dumps(boat), 200)
                elif boat and boat["owner"] != id_info.get('sub'):
                    return_message = {"Error" : "You cannot view boats you do not own"}
                    return(json.dumps(return_message), 403)
                else:
                    return_message = {"Error" : "No boat with this boat_id exists"}
                    return(json.dumps(return_message), 404)
            else:
                return_message = {"Error" : "That HTTP method is not recognized on this page"}
                return (json.dumps(return_message), 405)
    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)

@app.route('/boats/<id>', methods=['PATCH','PUT'])
def updateBoats(id):
    boat_key = client.key(constants.boats, int(id))
    boat = client.get(key=boat_key)
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        if request.method == 'PUT' :
                content = request.get_json()
                if not(content) or len(content) < 3 :
                    return_message = {"Error" : "The request object is missing at least one of the required attributes"}
                    return (json.dumps(return_message), 400)
                
                boat_key = client.key(constants.boats, int(id))
                boat = client.get(key=boat_key)
                if boat and boat["owner"] == id_info.get('sub'):
                    boat.update({"name": content["name"], "type": content["type"],
                        "length": content["length"]})
                    client.put(boat)
                    boat["id"] = boat.key.id
                    boat["self"] = "https://mccarrom-final.ue.r.appspot.com/boats/" + str(boat.key.id)
                    return (json.dumps(boat),200)
                elif boat and boat["owner"] != id_info.get('sub'):
                    return_message = {"Error" : "You cannot edit boats you do not own"}
                    return(json.dumps(return_message), 403)
                else:
                    return_message = {"Error" : "No boat with this boat_id exists"}
                    return(json.dumps(return_message), 404)
        elif request.method == 'PATCH':
            content = request.get_json()
            if not(content):
                return_message = {"Error" : "There is something wrong with the request object"}
                return (json.dumps(return_message), 400)
            boat_key = client.key(constants.boats, int(id))
            boat = client.get(key=boat_key)

            if 'name' in content.keys() or 'type' in content.keys() or 'length' in content.keys():
                if boat and boat["owner"] == id_info.get('sub'):
                    if 'name' in content.keys():
                        boat.update({"name": content["name"]})
                    if 'type' in content.keys():
                        boat.update({"type": content["type"]})
                    if 'length' in content.keys():
                        boat.update({"length": content["length"]})
                    client.put(boat)
                    boat["id"] = boat.key.id
                    boat["self"] = "https://mccarrom-final.ue.r.appspot.com/boats/" + str(boat.key.id)
                    return (json.dumps(boat),200)
                elif boat and boat["owner"] != id_info.get('sub'):
                        return_message = {"Error" : "You cannot edit boats you do not own"}
                        return(json.dumps(return_message), 403)
                else:
                    return_message = {"Error" : "No boat with this boat_id exists"}
                    return(json.dumps(return_message), 404)
            else:
                return_message = {"Error" : "There is something wrong with the request object"}
                return (json.dumps(return_message), 400)
            
        else:
            return_message = {"Error" : "That HTTP method is not recognized on this page"}
            return (json.dumps(return_message), 405)
    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)
    

@app.route('/boats/<id>', methods=['DELETE'])
def deleteBoat(id):
    boat_key = client.key(constants.boats, int(id))
    boat = client.get(key=boat_key)
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        if request.method == 'DELETE':
            if boat and boat["owner"] == id_info.get('sub'):
                if 'loads' in boat.keys():
                    for e in boat['loads']:
                        addDeleteLoadFromBoatsSideEffects(id, e)
                client.delete(boat_key)
                return ('', 204)
            elif boat and boat["owner"] != id_info.get('sub'):
                return_message = {"Error" : "You cannot delete boats you do not own"}
                return(json.dumps(return_message), 403)
            else : 
                return_message = {"Error": "No boat exists with that boat_id"}
                return(json.dumps(return_message), 404)
        else:
            return_message = {"Error" : "That HTTP method is not recognized on this page"}
            return (json.dumps(return_message), 405)
    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)


@app.route('/loads', methods=['POST'])
def createLoads():
    if request.method == 'POST':
        content = request.get_json()
        if not(content) or len(content) < 3:
            return(("There is something wrong with the request object"), 400)
        else:
            new_load = datastore.entity.Entity(key=client.key(constants.loads))
            new_load.update({"weight": content["weight"], "content": content["content"],
              "delivery_date": content["delivery_date"]})
            client.put(new_load)
            new_load["id"] = new_load.key.id
            new_load["self"] = "https://mccarrom-final.ue.r.appspot.com/loads/" + str(new_load.key.id)
            return (json.dumps(new_load), 201)
    else:
        return_message = {"Error" : "That HTTP method is not recognized on this page"}
        return (json.dumps(return_message), 405)

@app.route('/loads', methods=['GET'])
def getAllLoads():
    if request.method == 'GET':
        query = client.query(kind=constants.loads)
        q_limit = int(request.args.get('limit', '5'))
        q_offset = int(request.args.get('offset', '0'))
        numberOfLoads=len(list(query.fetch()))
        l_iterator = query.fetch(limit= q_limit, offset=q_offset)
        pages = l_iterator.pages
        results = list(next(pages))
        if l_iterator.next_page_token:
            next_offset = q_offset + q_limit
            next_url = request.base_url + "?limit=" + str(q_limit) + "&offset=" + str(next_offset)
        else:
            next_url = None
        for e in results:
            e["id"] = e.key.id
        output = {"total loads": numberOfLoads, "loads": results}
        if next_url:
            output["next"] = next_url

        return (json.dumps(output), 200)
               
    else:
        return_message = {"Error" : "That HTTP method is not recognized on this page"}
        return (json.dumps(return_message), 405)

@app.route('/loads/<id>', methods=['GET'])
def getThisLoad(id):
    if request.method == 'GET':
        load_key = client.key(constants.loads, int(id))
        load = client.get(key=load_key)
        if load:
            load["id"] = load.key.id
            load["self"] = "https://mccarrom-final.ue.r.appspot.com/loads/" + str(load.key.id)
            return (json.dumps(load), 200)
        else:
            return_message = {"Error" : "No load with this id exists"}
            return(json.dumps(return_message), 404)
    else: 
        return_message = {"Error" : "That HTTP method is not recognized on this page"}
        return (json.dumps(return_message), 405)

@app.route('/loads/<id>', methods=['PATCH','PUT'])
def updateLoads(id):
    if request.method == 'PUT' :
        content = request.get_json()
        if not(content) or len(content) < 3 :
            return_message = {"Error" : "The request object is missing at least one of the required attributes"}
            return (json.dumps(return_message), 400)
        
        load_key = client.key(constants.loads, int(id))
        load = client.get(key=load_key)
        if load:
            load.update({"content": content["content"], "weight": content["weight"],
                "delivery_date": content["delivery_date"]})
            client.put(load)
            load["id"] = load.key.id
            load["self"] = "https://mccarrom-final.ue.r.appspot.com/loads/" + str(load.key.id)
            return (json.dumps(load),200)
        else:
            return_message = {"Error" : "No load with this load_id exists"}
            return(json.dumps(return_message), 404)
    elif request.method == 'PATCH':
        content = request.get_json()
        if not(content):
            return_message = {"Error" : "There is something wrong with the request object"}
            return (json.dumps(return_message), 400)
        load_key = client.key(constants.loads, int(id))
        load = client.get(key=load_key)
        if 'content' in content.keys() or 'weight' in content.keys() or 'delivery_date' in content.keys():
            if load:
                if 'content' in content.keys():
                    load.update({"content": content["content"]})
                if 'weight' in content.keys():
                    load.update({"weight": content["weight"]})
                if 'delivery_date' in content.keys():
                    load.update({"delivery_date": content["delivery_date"]})

                client.put(load)
                load["id"] = load.key.id
                load["self"] = "https://mccarrom-final.ue.r.appspot.com/loads/" + str(load.key.id)
                return (json.dumps(load),200)
            else:
                return_message = {"Error" : "No load with this load_id exists"}
                return(json.dumps(return_message), 404)
        else:
            return_message = {"Error" : "There is something wrong with the request object"}
            return (json.dumps(return_message), 400)
        
    else:
        return_message = {"Error" : "That HTTP method is not recognized on this page"}
        return (json.dumps(return_message), 405)

@app.route('/loads/<id>', methods=['DELETE'])
def deleteLoad(id):
    if request.method == 'DELETE':
        load_key = client.key(constants.loads, int(id))
        load = client.get(key=load_key)
        if load and 'carrier' not in load.keys(): 
            client.delete(key=load_key)
            return ('',204)
        elif load and 'carrier' in load.keys():
            boat_id = load['carrier'][0]
            addDeleteLoadFromBoatsSideEffects(boat_id, id)
            client.delete(key=load_key)
            return ('',204)
        else:
            return_message = {"Error" : "No load with this id exists"}
            return(json.dumps(return_message), 404)
    else:
        return_message = {"Error" : "That HTTP method is not recognized on this page"}
        return (json.dumps(return_message), 405)

@app.route('/boats/<boat_id>/loads/<load_id>', methods=['PUT','DELETE'])
def addDeleteLoadsFromBoats(boat_id, load_id):
    req = requests.Request()
    try:
        authorizationHeader = request.headers['authorization']
        authorizationHeader = authorizationHeader[7:]
        id_info = id_token.verify_oauth2_token( authorizationHeader, req, client_id)
        boat_key = client.key(constants.boats, int(boat_id))
        boat = client.get(key=boat_key)
        load_key = client.key(constants.loads, int(load_id))
        load = client.get(key=load_key)

        if request.method == 'PUT':
            if boat and boat["owner"] == id_info.get('sub'):
                if 'loads' in boat.keys():
                    boat['loads'].append(load.key.id)
                else:
                    boat['loads'] = [load.key.id]
                client.put(boat)
                load['carrier'] = [boat.id]
                client.put(load)
                return('',204)
            elif boat and boat["owner"] != id_info.get('sub'):
                return_message = {"Error" : "You cannot load cargo onto boats you do not own"}
                return(json.dumps(return_message), 403)
            else:
                return_message = {"Error" : "No boat with this boat_id exists"}
                return(json.dumps(return_message), 404)

        if request.method == 'DELETE':
            if boat and boat["owner"] == id_info.get('sub'):
                if 'loads' in boat.keys():
                    boat['loads'].remove(int(load_id))
                    client.put(boat)
                load['carrier'].remove(int(boat_id))
                client.put(load)
                return('',204)
            elif boat and boat["owner"] != id_info.get('sub'):
                return_message = {"Error" : "You cannot load cargo onto boats you do not own"}
                return(json.dumps(return_message), 403)
            else:
                return_message = {"Error" : "No boat with this boat_id exists"}
                return(json.dumps(return_message), 404)

    except KeyError:
        return ("Missing JWT", 401)
    except ValueError:
        return("Invalid JWT", 401)

def addDeleteLoadFromBoatsSideEffects(boat_id, load_id):
    boat_key = client.key(constants.boats, int(boat_id))
    boat = client.get(key=boat_key)
    load_key = client.key(constants.loads, int(load_id))
    load = client.get(key=load_key)

    if request.method == 'PUT':
        if 'loads' in boat.keys():
            boat['loads'].append(load.key.id)
        else:
            boat['loads'] = [load.key.id]
        client.put(boat)
        load['carrier'] = [boat.id]
        client.put(load)
        return('',200)

    if request.method == 'DELETE':
        if 'loads' in boat.keys():
            boat['loads'].remove(int(load_id))
            client.put(boat)
        load['carrier'].remove(int(boat_id))
        client.put(load)
        return('',200)

if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)