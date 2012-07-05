
exports.createAdaptor = require("Adaptor.js").init;

exports.decimalToHex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 8 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return "0x"+hex;
}


exports.createFastParser = function(callBack){
    return new FastJSONParser(callBack);
}

var READ_SIZE  = 1;
var READ_JSON = 3;

var JSONMAXSIZE_CHARS_HEADER=11; //8+3    // 0xFFFFFFFF\n is the max size    : 0x00000001\n is the min size, ( not a valid JSON!)

function FastJSONParser(callBack){
    this.state = READ_SIZE;
    this.buffer = "";
    this.nextSize = 0;
    this.callBack = callBack;
}

FastJSONParser.prototype.parseNewData = function(data){
    this.buffer += data;
    var doAgain = true;
    while(doAgain){
        doAgain = false;
        if(this.state == READ_SIZE){
            if(this.buffer.length >= JSONMAXSIZE_CHARS_HEADER){
                this.nextSize = parseInt(this.buffer.substr(0,JSONMAXSIZE_CHARS_HEADER));
                this.buffer = this.buffer.substring(JSONMAXSIZE_CHARS_HEADER);
                this.state = READ_JSON;
            }
        }

        if(this.state == READ_JSON){
            if(this.buffer.length >= this.nextSize){
                this.callBack(JSON.parse(this.buffer.substr(0,this.nextSize)));
                this.buffer = this.buffer.substring(this.nextSize+1); // a new line should be passed after json
                doAgain = true;
                this.state = READ_SIZE;
            }
        }
    }
}

exports.writeObject = function(sock,object){
 var str=JSON.stringify(object);
 exports.writeSizedString (sock,str);
}

exports.writeSizedString=function(sock,str){ //write size and JSON serialised form of the object
	var sizeLine=exports.decimalToHex(str.length)+"\n";
	sock.write(sizeLine);	
	sock.write(str+"\n");
}


exports.printf = function(format){
    var out = util.format(format,arguments);
    util.puts(out);
}


exports.inspect = function (object){
    var out =   "----------------------------------------------------------------------\n"+
                util.inspect(format,arguments) +
                "----------------------------------------------------------------------\n";
    util.puts(out);
}
