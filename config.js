// module
// exports config
module.exports = {
  // mongo, obj
  mongo: {
    // db name
    name: 'osmosis_drive',
    // localhost
    host: '127.0.0.1',
    // port
    port: 27017,
    // username
    username: 'osmosis_drive',
    // password
    password: 'osmosis_drive',
    url: function() {
      return ['mongodb://',
        this.username, ':',
        this.password, '@',
        this.host, ':', this.port, '/', this.name].join('');
    }
  },
  mongoOptions: {
    server: {
      poolSize: 1,
      socketOptions: {
        auto_reconnect: true
      }
    }
  }
}

