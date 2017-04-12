const osmosis = require('osmosis');
const Promise = require('bluebird');
const CarDAO = require('./model/car');
const carDAO = new CarDAO();

const theListArr = [
  {
    // start === 0
    list: 'http://www.drive.com.au/new-car-search?makeMulti[0]=audi&sortBy=1&page=',
    num: 5,
    cat: 'audi'
  },
  {
    list: 'http://www.drive.com.au/new-car-search?makeMulti[0]=bmw&sortBy=1&page=',
    num: 5,
    cat: 'bmw'
  },
  {
    list: 'http://www.drive.com.au/new-car-search?makeMulti[]=ferrari&sortBy=1&page=',
    num: 1,
    cat: 'ferrari'
  },
  {
    list: 'http://www.drive.com.au/new-car-search?makeMulti[0]=porsche&sortBy=1&page=',
    num: 4,
    cat: 'porsche'
  }
];


function genEachPage(theList, theListLength) {
  const theReturn = [];
  for(var i=1; i<=theListLength; i++) {
    let page = theList + i;
    theReturn.push(page);
  }

  return theReturn;
}


function run() {
  return Promise.each(theListArr, (listObj) => {
    return new Promise((resolve, reject) => {
      console.log('====' + listObj.list + '====');
      let myArr = genEachPage(listObj.list, listObj.num);

      Promise.each(myArr, (singlePage) => {
        return new Promise((resolve1, reject1) => {
          console.log();
          console.log('~~~~~~' + singlePage + '~~~~~~');

          osmosis
            .get(singlePage)
            .find('.listing') // so we actually needs to use find, to find the parent.
            .set({
              'title': 'h6',
              'url': '.moreInfo a@href',
              'price': '.price b',
              'imgUrl': 'img@src',
              'seats': '.seats'
            })
            .data((data) => {
              //console.log('--- one ---');
              //console.log(data);

              let obj = {
                title: data.title,
                url: 'http://www.drive.com.au' + data.url,
                category: listObj.cat,
                price: data.price,
                imgUrl: data.imgUrl,
                seats: data.seats
              };

              carDAO
                .save(obj)
                .then(() => {
                  resolve1();
                });
            }); // end osmosis

        }).delay(3000);
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
  return carDAO.delete();
}


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
