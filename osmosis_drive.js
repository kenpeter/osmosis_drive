var osmosis = require('osmosis');
var Promise = require('bluebird');
var CronJob = require('cron').CronJob;
var JobDAO = require('./model/job');

const jobDAO = new JobDAO();

const theListArr = [
  {
    // start === 0
    list: 'https://au.indeed.com/jobs?q=php&l=melbourne&start=',
    num: 10,
    cat: 'php_melbourne'
  },
  {
    list: 'https://au.indeed.com/jobs?q=web&l=melbourne&start=',
    num: 10,
    cat: 'web_melbourne'
  },
  {
    list: 'https://au.indeed.com/jobs?q=javascript&l=melbourne&start=',
    num: 10, // max 10
    cat: 'javascript_melbourne'
  },
  {
    list: 'https://au.indeed.com/jobs?q=IT&l=melbourne&start=',
    num: 10, // max 10
    cat: 'it_melbourne'
  }
];

/*
const theListArr = [
  {
    // start === 0
    list: 'https://au.indeed.com/jobs?q=php&l=melbourne&start=',
    num: 4,
    cat: 'php_melbourne'
  },
  {
    list: 'https://au.indeed.com/jobs?q=web&l=melbourne&start=',
    num: 4,
    cat: 'web_melbourne'
  }
];
*/

function genEachPage(theList, theListLength) {
  const theReturn = [];
  // run every 10 pages
  for(var i=0; i<theListLength; i++) {
    let page = theList + i*10;
    theReturn.push(page);
  }

  return theReturn;
}


function run() {
  return Promise.each(theListArr, (listObj) => {
    return new Promise((resolve, reject) => {
      console.log('====' + listObj.list + '====');
      let jobArr = genEachPage(listObj.list, listObj.num);

      Promise.each(jobArr, (singlePage) => {
        return new Promise((resolve1, reject1) => {
          console.log();
          console.log('~~~~~~' + singlePage + '~~~~~~');

          osmosis
            .get(singlePage)
            .find('.row') // so we actually needs to use find, to find the parent.
            .set({
              'jobTitle': '.jobtitle',
              'jobUrl': 'a@href',
              'company': '.company',
              'summary': '.summary',
              'date': '.date'
            })
            .data((data) => {
              //
              // console.log(data);


              let jobId = '';
              let jobTitle = data.jobTitle;
              let jobUrl = 'https://au.indeed.com' + data.jobUrl;
              let category = listObj.cat;

              let advertiser = data.company;
              let summary = data.summary;

              let whenPosted = '';
              if(data.date === undefined) {
                whenPosted = 'unknown';
              }
              else {
                whenPosted = data.date;
              }


              /*
              console.log('-- one data --');
              console.log(jobId);
              console.log(jobTitle);
              console.log(jobUrl);
              console.log(category);

              console.log(advertiser);
              console.log(summary);
              console.log(whenPosted);
              */

              let obj = {
                jobId: jobId,
                jobTitle: jobTitle,
                jobUrl: jobUrl,
                category: category,

                advertiser: advertiser,
                summary: summary,
                whenPosted: whenPosted
              };

              jobDAO
                .save(obj)
                .then(() => {
                  resolve1();
                });

            }); // end osmosis

        }).delay(1000);
      })
      .then(() => {
        // ..............
        resolve();
      })
      .catch((err) => {
        console.log('--- page array error:' + theList);
        console.error(err);
        reject();
      });

    });

  });

}

function cleanup() {
  return jobDAO.delete();
}

/*
cleanup()
.then(() => {
  return run();
})
.then(() => {
  console.log('--- all done ---');
  process.exit(0);
})
.catch(err => {
  console.log('--- main error ---');
  console.error(err);
  process.exit(1);
});
*/

var job = new CronJob('0 * 14 * * *', () => {
  cleanup()
  .then(() => {
    return run();
  })
  .then(() => {
    console.log('--- all done ---');
    process.exit(0);
  })
  .catch(err => {
    console.log('--- main error ---');
    console.error(err);
    process.exit(1);
  });
}, () => {
  console.log('--- cront done ---');
},
  true,
  'Etc/UTC'
);
