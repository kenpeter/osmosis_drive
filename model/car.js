var mongodb = require('./connect');

var Schema = mongodb.mongoose.Schema;

var CarSchema = new Schema({
  title: String,
  url: String,
  category: String,
  price: String,

  imgUrl: String,
  seats: String,
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

var CarDAO = function(){};
var Car = mongodb.mongoose.model('Car', CarSchema);

CarDAO.prototype =  {
  constructor: CarDAO,

  save: function(obj){
    return new Promise((resolve, reject) => {
      var instance = new Car(obj);
        instance.save((err) => {
          if(err) return reject(err);
          resolve();
        });
      });
    },

  delete: function(query) {
    return new Promise((resolve, reject) => {
      Car.remove(query, (err, data) => {
        if(err) return reject(err);
        resolve(data);
      });
    });
  }

  /*
  search: function(query){
    return new Promise((resolve, reject) => {
      Car.find(query, (err, data) => {
        if(err) return reject(err);
        var result = [];
        if(data) {
          for(var i=0,len=data.length;i<len;i++){
            d = {
              _id: data[i]._id,
              title: data[i].title,
              url: data[i].url,
              category: data[i].category,
              advertiser: data[i].advertiser,
              content: data[i].content
            }
            result.push(d)
          }
        }
        resolve(result);
      });
    });
  }
  */
}

module.exports = CarDAO;
