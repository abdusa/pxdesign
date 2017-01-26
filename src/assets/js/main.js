// function write here ...
var hello = {
  bil1: 3,
  bil2: 4,
  hasil: function(){
    return this.bil1 + this.bil2;
  }
};


console.log(hello.hasil());
