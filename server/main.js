// start up function that creates entries in the Websites databases.
Meteor.startup(function () {

// Add a search index on title
Websites._ensureIndex({
    "title": "text",
    "description" : "text"
},{
	default_language: "english",
	weights: {
       title: 10,
       description: 5
     },
     name: "WebsiteSearchIndex"
});
// code to run on server at startup
if (!Websites.findOne()){
	console.log("No websites yet. Creating starter data.");
	  Websites.insert({
		title:"Goldsmiths Computing Department", 
		url:"http://www.gold.ac.uk/computing/", 
		description:"This is where this course was developed.", 
		createdOn:new Date(),
		votes : 0,
		comments : []
	});
	 Websites.insert({
		title:"University of London", 
		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
		description:"University of London International Programme.", 
		createdOn:new Date(),
		votes : 0,
		comments : []
	});
	 Websites.insert({
		title:"Coursera", 
		url:"http://www.coursera.org", 
		description:"Universal access to the world’s best education.", 
		createdOn:new Date(),
		votes : 0,
		comments : []
	});
	Websites.insert({
		title:"Google", 
		url:"http://www.google.com", 
		description:"Popular search engine.", 
		createdOn:new Date(),
		votes : 0,
		comments : []
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

Meteor.methods({
	scrapeSite: function (url) {
		return Scrape.website(url);
	}
});

Meteor.publish("filteredWebsites", function(searchFilter) {

	if (searchFilter) {
		console.log('Searching with search filter: ' + searchFilter);
		return Websites.find(
			  { $text: {
				  $search: searchFilter
				}
			  },
			  {
				fields: {
				  score: {
					$meta: 'textScore'
				  }
				}
			  }
		);
	} else {
		console.log('Searching without search filter');
		return Websites.find({});
}

});
