Websites = new Mongo.Collection("websites");

if (Meteor.isClient) {

	Router.route('/', function () {
		this.layout('ApplicationLayout');
		this.render('landingPageContent', { to : 'maincontent'});
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});


	/////
	// template helpers 
	/////

	// helper function that returns all available websites
	Template.website_list.helpers({
		websites:function(){
			return Websites.find({},{sort: {votes : -1}});
		}
	});

	// Pretty dates using momentjs
	Template.registerHelper('formatDate', function(date) {
		return moment(date).startOf('second').fromNow();
	});


	/////
	// template events 
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);

			Websites.update({_id : website_id },{
				$inc :  { 'votes' : 1 }
			});
			
			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);

			Websites.update({_id : website_id },{
				$inc : { 'votes' : -1 }
			});

			return false;// prevent the button from reloading the page
		}
	})

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		}, 
		"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			console.log("The url they entered is: "+url);

			// Add site to collection
			// Validation is done server side
			Websites.insert({
				title: event.target.title.value,
				url:event.target.url.value,
				description:event.target.description.value,
				createdOn:new Date(),
				votes: 0
			});

			return false;// stop the form submit from reloading the page

		}
	});
}


if (Meteor.isServer) {
	// start up function that creates entries in the Websites databases.
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	  Websites.insert({
    		title:"Goldsmiths Computing Department", 
    		url:"http://www.gold.ac.uk/computing/", 
    		description:"This is where this course was developed.", 
    		createdOn:new Date(),
    		votes : 0
    	});
    	 Websites.insert({
    		title:"University of London", 
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
    		description:"University of London International Programme.", 
    		createdOn:new Date(),
    		votes : 0
    	});
    	 Websites.insert({
    		title:"Coursera", 
    		url:"http://www.coursera.org", 
    		description:"Universal access to the world’s best education.", 
    		createdOn:new Date(),
    		votes : 0
    	});
    	Websites.insert({
    		title:"Google", 
    		url:"http://www.google.com", 
    		description:"Popular search engine.", 
    		createdOn:new Date(),
    		votes : 0
    	});
    }
  });

  Websites.allow({
	insert: function (userId, doc) {
		if (Meteor.user()) { // user is logged in ...
			if (doc.url.length > 0 && doc.description.length > 0 && doc.title.length > 0) { // simple validation ( should check string formats )
				console.log("Valid site - will add website to collection");
				return true;
			} else {
				console.log("Site url, title or description are empty");
				return  false;
			}
		} else {
			console.log("User is not logged in");
			return false;
		}
	},
	update : function (userId ,doc) {
		if(Meteor.user()){ // user is logged in
			console.log("Allowing website update");
			return true;
		}
	} 
  });
}
