Session.set('searchFilter',undefined);
Session.set('lastVotedTerm',undefined);

Router.route('/', function () {
	this.layout('ApplicationLayout');
	this.render('landing_page_content', { to : 'maincontent'});
});

Router.route('/website/:_id', function(data) {
	this.layout('ApplicationLayout', {
		data: function () { return Websites.findOne({_id: this.params._id}) }
	});
	this.render('website_detail', { to : 'maincontent'});
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

		Meteor.subscribe("filteredWebsites", Session.get("searchFilter"));

		if (Session.get("searchFilter")) {
		  return Websites.find({}, { sort: [["score", "desc"]] });
		} else {
		  return Websites.find({});
		}
	
	}
});

Template.recommendations.helpers({
	recommendations:function(){
		Meteor.subscribe("recommendedWebsites", Session.get("lastVotedTerm"));

		if (Session.get("lastVotedTerm")) {
		  return Websites.find({}, { sort: [["score", "desc"]], limit:3 });
		} else {
		  return Websites.find({},{limit:3});
		}

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

		Session.set('lastVotedTerm',this.title.split(' ')[0]);
		console.log("Last voted term is " + Session.get('lastVotedTerm'));

		console.log("Up voting website with id "+website_id);

		Websites.update({_id : website_id },{
			$inc :  { 'votes' : 1 }
		});

		$('#reccomendationsModal').modal('show');

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

Template.website_form.helpers({
	"getInfoMsg":function() {
		return Session.get('infoMsg');
	}
});

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	},
	"submit .js-save-website-form":function(event){

		// here is an example of how to get the url out of the form:
		var url = event.target.url.value;
		console.log("The url they entered is: "+url);

		Meteor.call("scrapeSite",url,function(err,result) {

			if(!err) {
				// Pull title and description from the scraped content
				// or populate with 'N/A'
				var title = result.title || 'N/A';
				var description = result.description || 'N/A';

				// Add site to collection
				// Validation is done server side
				Websites.insert({
					url:url,
					title: title,
					description:description,
					createdOn:new Date(),
					votes: 0
				});
			} else {
				console.log("Error inserting site");
			}

		});

		return false;// stop the form submit from reloading the page
	}
});

Template.website_comment_form.events({
	"submit .js-add-website-comment":function(event) {

		var comment = event.target.website_comment.value;
		var website_id = this._id;

		Websites.update({_id: website_id }, { $push : { comments : {
				author : Meteor.user().username,
				comment : comment,
				createdOn : new Date()
			}
		}});

		event.target.website_comment.value = ''; // clear form value
		return false;// stop the form submit from reloading the page
	}
});

Template.website_list.events({
	"submit .js-filter-list":function(event){
		Session.set('searchFilter',event.target.search_field.value);
		return false;
	}

});
