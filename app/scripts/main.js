'use strict';

//Variables linking DOM Elements
var opportunityForm = document.getElementById('opportunity-form');

//All form elements
var opportunityTitle = document.getElementById('new-opportunity-title');
var opportunityCategory = document.getElementById('new-opportunity-category');
var opportunityOrganisation = document.getElementById('new-opportunity-organisation');
var opportunityTotalCommitment = document.getElementById('new-opportunity-total-commitment');
var opportunityActivityStatusDate = document.getElementById('new-opportunity-activity-status-/-date');
var opportunityAddress = document.getElementById('new-opportunity-address');
var opportunityCommitment = document.getElementById('new-opportunity-commitment');
var opportunityDescription = document.getElementById('new-opportunity-description');
var opportunityEmail = document.getElementById('new-opportunity-email');

//Miscellaneous elements
var splashPage = document.getElementById('splash-page');
var googleSignInButton = document.getElementById('google-sign-in-button');
var epSignInButton = document.getElementById('ep-sign-in-button');
var addOpportunity = document.getElementById('add-opportunity');
var addButton = document.getElementById('add');
var publicPostsSection = document.getElementById('public-posts-list');
var myPostsSection = document.getElementById('my-posts-list');
var myFeedMenuButton = document.getElementById('my-feed');
var publicFeedMenuButton = document.getElementById('public-feed');
var signOutButton = document.getElementById('sign-out');
var email = document.getElementById('email');
var password = document.getElementById('userpass');
/**
Pushing opportunity to database/
*/
function postOpportunity(
  uid,
  username,
  title,
  category,
  totalCommitment,
  activityStatusDate,
  address,
  commitment,
  organisation,
  description
  ) {
	var oppData = {
		organisation: username,
		uid: uid,
		title: title,
    category: category,
    totalCommitment: totalCommitment,
    activityStatusDate: activityStatusDate,
    address: address,
    commitment: commitment,
		organisation: organisation,
    description: description
	};

	// new key for opportunity
	var newOppKey = firebase.database().ref().child('opportunities').push().key;
	var updates = {};
	updates['/opportunities/' + newOppKey] = oppData;
	updates['/user-opp/' + uid + '/' + newOppKey] = oppData;

	return firebase.database().ref().update(updates);
  
}

function createOppElement(oppId, title, organisation, description ) {
	var uid = getUser().uid;
  console.log("Opportunity Created");
	var html ='<div class="post mdl-cell mdl-cell--12-col ' +
                  	'mdl-cell--6-col-tablet mdl-grid">' +
			        '<div class="mdl-card mdl-shadow--6dp">' +
			          '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
			            '<h4 class="mdl-card__title-text"></h4>' +
			          '</div>' +
			          '<div class="header">' +
			            '<div>' +
			              '<div class="avatar"></div>' +
			              '<div class="username mdl-color-text--black"></div>' +
			            '</div>' +
			          '</div>' +
			          '<div class="mdl-card__supporting-text">' +
			          	'<h6 class="description"></h6>' +
			          '</div>'+
			          '<div class="mdl-card__actions mdl-card--border">' +
                        '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect dialog-button">' +
                          'Apply' +
                        '</a>' +
                        '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">' +
                          'Invite' +
                        '</a>' +
                        '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">' +
                          'More Info' +
                        '</a>' +
                      '</div>' +
			          '</div>' +
			      '</div>';
	var div = document.createElement('div');
	div.innerHTML = html;
	var oppElement = div.firstChild;
	oppElement.getElementsByClassName('description')[0].innerText = description;
  oppElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  oppElement.getElementsByClassName('username')[0].innerText = organisation;

  return oppElement;
  
}

function startDatabaseQueries() {
	var myUserId = getUser().uid;
	var recentPostsRef = firebase.database().ref('opportunities').limitToLast(100);
	var userPostsRef = firebase.database().ref('user-opp/' + myUserId);

	var fetchPosts = function(postsRef, sectionElement) {
		postsRef.on('child_added', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			containerElement.insertBefore(
				createOppElement(data.key, data.val().title, data.val().organisation, data.val().description), 
				containerElement.firstChild);
      //console.log("I fetched posts");
		});
	};
	fetchPosts(recentPostsRef, publicPostsSection);
  fetchPosts(userPostsRef, myPostsSection);
}
function writeUserData(userId, name, email) {
	firebase.database().ref('users/' + userId).set({
    username: name,
    email: email
  });
  //console.log("I wrote user data")
}

  function getUser() {
    var user = firebase.auth().currentUser;
    return user;
  }

window.addEventListener('load', function() {
  // Bind Email and Password Sign in button.
  
  epSignInButton.addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('userpass').value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
          // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        console.error(error);
      }
          // [END_EXCLUDE]
      });
    // var provider = new firebase.auth.GoogleAuthProvider();
    // firebase.auth().signInWithPopup(provider);
  });

  googleSignInButton.addEventListener('click', function(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider); 
  });

  var user = firebase.auth().currentUser;
  
  // Bind sign out button
  signOutButton.addEventListener('click', function(){
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
      email.value = '';
      password.value = '';
    }, function(error) {
        console.error('Sign Out Error', error);
      });
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(function(user) {
    
    if (user) {
      var providerName = user.providerData[0].providerId;
      console.log(providerName);
      if (providerName === "google.com") {
        console.log('I come from Google');
        addButton.style.display = 'none';
        splashPage.style.display = 'none';
        // addButton.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email);
        startDatabaseQueries();
      } 
      else if(providerName === "password") {
        console.log('I come from Password');
        splashPage.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email);
        startDatabaseQueries(); 
      } 
    } 
    else {
        splashPage.style.display = 'block';
      }

  });

  // Saves message on form submit.
  opportunityForm.onsubmit = function(e) {
    e.preventDefault();
    if (opportunityDescription.value && opportunityTitle.value && opportunityOrganisation.value) {
      var postText = opportunityDescription.value;
      opportunityDescription.value = '';
      console.log("Reporting from submit function");
      // [START single_value_read]
      var userId = getUser().uid;
      firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        var username = snapshot.val().username;
        // [START_EXCLUDE]
        postOpportunity(
            userId,
            username,
            opportunityTitle.value,
            opportunityCategory.value,
            opportunityTotalCommitment.value,
            opportunityActivityStatusDate.value,
            opportunityAddress.value,
            opportunityCommitment.value,
            opportunityOrganisation.value,
            postText
            ).then(function() {
              //publicFeedMenu.click();
            });
        // [END_EXCLUDE]
      });
      // [END single_value_read]
    }
  };

  // Bind menu buttons.
  publicFeedMenuButton.onclick = function() {
    publicPostsSection.style.display = 'block';
    myPostsSection.style.display = 'none';
    addOpportunity.style.display = 'none';
    publicFeedMenuButton.classList.add('is-active');
    myFeedMenuButton.classList.remove('is-active');
  };
  myFeedMenuButton.onclick = function() {
    publicPostsSection.style.display = 'none';
    myPostsSection.style.display = 'block';
    addOpportunity.style.display = 'none';
    publicFeedMenuButton.classList.remove('is-active');
    myFeedMenuButton.classList.add('is-active');
  };
  addButton.onclick = function() {
    publicPostsSection.style.display = 'none';
    myPostsSection.style.display = 'none';
    addOpportunity.style.display = 'block';
    publicFeedMenuButton.classList.remove('is-active');
    myFeedMenuButton.classList.remove('is-active');
    opportunityDescription.value = '';
    opportunityTitle.value = '';
    opportunityOrganisation.value = '';
  };
  publicFeedMenuButton.onclick();

}, false);