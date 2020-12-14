// This file contains the code to execute and display the quiz to help you pick a wine.
// Thanks to Eloquent JavaScript and SitePoint's Modern JavaScript Project Tutorials
//https://www.sitepoint.com/simple-javascript-quiz/ for their guidance
(function() {
  function buildQuiz() {
    //array to store output of quiz
    const output = [];

    // each question has a list of answer choices and a radio button to selector
    //that answer
    myQuestions.forEach((currentQuestion, questionNumber) => {

      const answers = [];

      for (letter in currentQuestion.answers) {
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    //combine output into one chunk of HTML to display
    quizContainer.innerHTML = output.join("");
  }

  //once the quiz is finished we collect the answers and evalutate them
  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let score = 0;

    // for each question we will add to the user's score the appropriate amounts
    //as dictated by which answer was chosen and which question is being
    //evaluated, the questions are indexed like an array starting at 0
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      if(questionNumber === 0){
        if(userAnswer === currentQuestion.groupA){
          score +=1;
        }
        if(userAnswer === currentQuestion.groupB){
          score +=2;
        }
        if(userAnswer === currentQuestion.groupC){
          score +=3;
        }
        if(userAnswer === currentQuestion.groupD){
          score +=4;
        }
      }
      if(questionNumber === 1){
        if(userAnswer === currentQuestion.groupA){
          score +=10;
        }
        if(userAnswer === currentQuestion.groupB){
          score +=20;
        }
        if(userAnswer === currentQuestion.groupC){
          score +=30;
        }
      }
      if(questionNumber === 2){
        if(userAnswer === currentQuestion.groupA){
          score +=100;
        }
        if(userAnswer === currentQuestion.groupB){
          score +=200;
        }
      }
      if(questionNumber === 3){
        if(userAnswer === currentQuestion.groupA){
          score +=1000;
        }
        if(userAnswer === currentQuestion.groupB){
          score +=2000;
        }
      }
    });


    // switch used to evaluate the user's total score and display the appropriate
    //wine recommendations accordingly
    var displayResult;
    switch (score) {
      case 1111:
        displayResult = "You want a sweet, fruity, light bodied, red wine. Try Sangue di Guida or Brachetto, both from Italy!";
        break;
      case 1121:
        displayResult = "You want a sweet, fruity, medium bodied, red wine. Try Dornfelder, from Germany, or some Malbecs from Argentina!";
        break;
      case 1131:
        displayResult = "You want a sweet, fruity, full bodied, red wine. You're about to fall in love with Port, a fortified wine from Portugal!";
        break;
      case 1211:
        displayResult = "You want a dry, fruity, light bodied, red wine. Try some Gamay or Counoise from France!";
        break;
      case 2211:
        displayResult = "You want a dry, earthy, light bodied, red wine. Try Oregon Pinot Noir or Red Burgundy (also Pinot Noir) from France!";
        break;
      case 1221:
        displayResult = "You want a dry, fruity, medium bodied, red wine. Try Nebbiolo from Northern Italy, or a Chianti from Tuscany. Some domestic Merlots will" +
                        " surely satisfy you too, as well as Carmenere from Chile and Garnacha from Spain!";
        break;
      case  2221:
        displayResult = "You want a dry, earthy, medium bodied, red wine. Look for an earthy Malbec from France or Argentina," +
                        " a Portuguese wine made with Touriga Nacional! Truthfully, there are so many wines in this category,"+
                        " ask your local wine shop for more suggestions!";
        break;
      case 1231:
        disaplyResult = "You want a dry, fruity, full bodied, red wine. California Cabernet will surely hit the spot," +
                        " but why not try a Zinfandel from Cali or a Syrah from Washington or Australia to really branch out!";
        break;
      case 2231:
        displayResult ="You want a dry, earthy, full bodied, red wine. If you can swing it, try Brunello di Montalcino from Italy, " +
                        " or a Gran Reserva Rioja from Spain. If those are out of your price range,"+
                        " look for something Portuguese, the're always a bargain, or a table wine from Bordeaux with a good amount of Cabernet Franc!";
        break;
      case 1112:
        displayResult ="You want a sweet, fruity, light bodied, white wine. Moscato is going to become your best friend"+
                        " but you might also try a Gewurztraminer or a sweet Riesling!";
        break;
      case 1212:
        displayResult ="You want a dry, fruity, light bodied, white wine. Try a New Zealand Sauvignon Blanc or a"+
                        " Spanish Albraiño for something new and exciting!";
        break;
      case 1222:
        displayResult ="You want a dry, fruity, medium bodied, white wine. Viognier from Australia should hit the spot!";
        break;
      case 2222:
        displayResult ="You want a dry, earthy, medium bodied, white wine. Gavi di Gavi from Italy is medium bodied with lots of"+
                        " earthy, minerally, undertones, to accompany the unripe pit fruit notes, as well as an oily mouthfeel"+
                        " sure to please!";
        break;
      case 1232:
        displayResult ="You want a dry, fruity, full bodied, white wine. A white Rhone blend might hit the spot, as well as Viognier"+
                        " from cooler climates.";
        break;
      case 2232:
        displayResult ="You want a dry, earthy, full bodied, white wine.Unoaked French Chardonnay, such as my favorite from Chablis, "+
                        "would be perfect. To mix things up you could try a Sémillon from France or Australia.";
        break;
      case 1113:
        displayResult ="You want a sweet, fruity, light bodied, rosé wine. You could go with the old mainstay White Zinfandel, "+
                        "but if you want something a little more refined try a rosé Vinho Verde from Portugal!";
        break;
      case 1213:
        displayResult = "You want a dry, fruity, light bodied, rosé wine. This is pretty much all French Rosé, and any Rosé"+
                        " that is emulating the French style. Look for something from Provence if you want a very slight salinity"+
                        " to your wine, or something from South Africa for a bargain";
        break;
      case 1123:
        displayResult = "You want a sweet, fruity, medium bodied, rosé wine. A lot of South African and Spanish rosés fall into this category."+
                        " Look for something with lowr alcohol and notes of strawberry or watermelon!";
        break;
      case 1223:
        displayResult = "You want a dry, fruity, medium bodied, rosé wine. There is very little rosé coming out of Bordeaux but"+
                        " if you can find it, it'll fit this bill. These wines are usually Cabernet Franc based and about as big"+
                        " as a rosé can get!";
        break;
      case 104:
        displayResult ="You want a sweet, sparkling wine. Sparkling wine, like any other wine, can come in a variety of sweetnesses. Look for something"+
                        " with the words 'demi-sec' or 'extra-dry' (depending on the country of origin) on the label for something with a hint of"+
                        " sweetness. Contrary to popular belief not all Italian Proseccos are sweet, but they do tend to be fruitier "+
                        "than Champagnes, Cavas, and California Sparklers, and we taste 'fruit' as 'sweet'. ";
        break;
      case 204:
        displayResult = "You want a dry, sparkling wine. The sky is your limit, just please stay away from anything from"+
                        " California that says the word 'Champagne.' These bottles are lying to you! Champagne refers to a "+
                        "very specific wine, from a very specific region of France, and everbody in Europe agreed to these"+
                        " terms in the beginning of the 20th century. The US was (in)conveniently in the middle of Prohibition"+
                        " at the time. When Prohibition ended, domestic sparkling wine producers used this as a loophole and started"+
                        " slapping the word Champagne on anything with bubbles. If you want something like Champagne without the price tag try Cremant,"+
                        " another French sparkler from elsewhere in France, or Cava, which is <em>super</em> cheap and made in the same method "+
                        "as Champagne";
        break;
      default:
        displayResult = "Hmmm you've stumped me with that one, ask your local wine " +
                        "shop what they would suggest. Or if you're just looking for something really weird," +
                        "try an Orange Pet Nat from California, it's a natural sparkling wine, made with white grapes "+
                        "that have spent time hanging out with their skins, like a red wine, and getting really funky together!";
        break;
      }
    resultsContainer.innerHTML = displayResult;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
  const myQuestions = [
    {
      question: "Red or White?",
      answers:{
        a: "Red",
        b: "White",
        c: "Rosé",
        d: "Sparkling"
      },

      groupA: "a",
      groupB: "b",
      groupC: "c",
      groupD: "d"

    },
    {
      question: "Light, Medium, or Full Bodied?",
      answers:{
        a: "Light",
        b: "Medium",
        c: "Full"
      },

      groupA: "a",
      groupB: "b",
      groupC: "c"

    },
    {
      question: "Sweet or Not Sweet?",
      answers:{
        a: "Sweet",
        b: "Not Sweet"
      },

      groupA: "a",
      groupB: "b"

    },
    {
      question: "Fruity or Earthy?",
      answers:{
        a: "Fruity",
        b: "Earthy"
      },

      groupA: "a",
      groupB: "b"

    }
  ];


  // display quiz on page load
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();
