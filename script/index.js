'use strict'
require('https').createServer().listen(3002); // just to make the process does not exit.
const yaml = require('js-yaml');
const axios = require('axios').default;
const yamlArr = [];

async function main() {

  try {
    const searchURLBase = "https://api.github.com/search/repositories?q=org:bcgov+nr-+in:name";
    const query = 'q=' + encodeURIComponent('org:bcgov+nr-+in:name') + '&type=Repositories';
    const rawGitUrlBase = 'https://raw.githubusercontent.com/bcgov/';
    const searchResponse = await axios.get(searchURLBase + query);

    for (const data of searchResponse.data.items) {
      if (data) {
        const name = data.name;
        try {
          const compliance = await axios.get(rawGitUrlBase + name + '/main/publiccode.yml');
          const doc = yaml.load(compliance.data);
          yamlArr.push(doc);
        } catch (e) {
          try {
            const compliance = await axios.get(rawGitUrlBase + name + '/master/publiccode.yml');
            const doc = yaml.load(compliance.data);
            yamlArr.push(doc);
          } catch (e) {
            //does not exist , continue to the next item in the for loop.
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main().then(() => {
  console.info('process completed.', yamlArr);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
