const config = (function() {
  var configObject = require('../config/production');
  try {
    var localConfig = require('../config/local');
    configObject = Object.assign(configObject, localConfig);
  } catch (ex) {}
  return configObject;
})();

const moment = require('moment');
const MavenlinkAPI = require('./MavenLinkAPI.class');

var mavenlink = new MavenlinkAPI(config);
var allData = {}; // Result set
var errorSet = []; // Any fetch errors and collected here

var extractMethods = []; // Accumulator for fetch promises

if (config.includeProjects) {
  console.log('Including Project');
  extractMethods.push(
    mavenlink.getAllProjects().then(projects => {
      console.log('Completed fetching Project Data');
      allData.projects = projects;
      return true;
    }, err => {
      errorSet.push(err);
    })
  );
}

if (config.includeTasks) {
  console.log('Including Tasks');
  extractMethods.push(
    mavenlink.getAllTasks().then(tasks => {
      console.log('Completed fetching Task Data');
      allData.tasks = tasks;
      return true;
    }, err => {
      errorSet.push(err);
    })
  );
}

if (config.includeComments) {
  console.log('Including Comments');
  extractMethods.push(
    mavenlink.getAllComments().then(comments => {
      console.log('Completed fetching Comment Data');
      allData.comments = comments;
      return true;
    }, err => {
      errorSet.push(err);
    })
  );
}

if (config.includeCustomFields) {
  console.log('Including Custom Fields');
  extractMethods.push(
    mavenlink.getAllProjectsCustomFields().then(customFields => {
      console.log('Completed fetching Custom Field Data');
      allData.customFields = customFields;
      return true;
    }, err => {
      errorSet.push(err);
    })
  );
}

Promise.all(extractMethods)
  .then(() => {
    console.log('process completed');
    if (errorSet.length > 0) {
      console.log(errorSet);
    }
  })
  .then(() => {
    console.log(Object.keys(allData));
    // reduce projects to projects that have been changed in the last week
    console.log(allData.projects[0]);
    // allData.project
    var dateRange = 7;
    var dateAfter = moment().subtract(dateRange, 'day');
    var recentProjects = allData.projects.filter(project => {
      return moment(project.updated_at).isAfter(dateAfter);
    });
    console.log(`${recentProjects.length} of ${allData.projects.length} changed within ${dateRange} days.`);
  }
);
