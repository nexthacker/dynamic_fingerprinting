ip_address = "lab.songli.io/uniquemachine/";
var Collector = function() {
  this.finalized = false;
  this.postData = {
    flashFonts: "No Flash",
    fonts: "",
    WebGL: false,
    inc: "Undefined",
    gpu: "Undefined",
    timezone: "Undefined",
    resolution: "Undefined",
    plugins: "Undefined",
    cookie: "Undefined",
    localstorage: "Undefined",
    manufacturer: "Undefined",
    gpuImgs: {},
    adBlock: "Undefined",
    cpu_cores: "Undefined", 
    canvas_test: "Undefined", 
    audio: "Undefined",
    langsDetected: [],
    video: []
  };

  // get the basic info of audio card
  this.audioFingerPrinting = function() {
    var finished = false;
    try{
      var audioCtx = new (window.AudioContext || window.webkitAudioContext),
          oscillator = audioCtx.createOscillator(),
          analyser = audioCtx.createAnalyser(),
          gainNode = audioCtx.createGain(),
          scriptProcessor = audioCtx.createScriptProcessor(4096,1,1);
      var destination = audioCtx.destination;
      return (audioCtx.sampleRate).toString() + '_' + destination.maxChannelCount + "_" + destination.numberOfInputs + '_' + destination.numberOfOutputs + '_' + destination.channelCount + '_' + destination.channelCountMode + '_' + destination.channelInterpretation;
    }
    catch (e) {
      return "not supported";
    }
  }

  // get the screen resolution
  this.getResolution = function() {
    var zoom_level = detectZoom.device();
    var fixed_width = window.screen.width * zoom_level;
    var fixed_height = window.screen.height * zoom_level;
    var res = Math.round(fixed_width) + '_' + Math.round(fixed_height) + '_' + zoom_level + '_' + window.screen.width+"_"+window.screen.height+"_"+window.screen.colorDepth+"_"+window.screen.availWidth + "_" + window.screen.availHeight + "_" + window.screen.left + '_' + window.screen.top + '_' + window.screen.availLeft + "_" + window.screen.availTop + "_" + window.innerWidth + "_" + window.outerWidth + "_" + detectZoom.zoom();
    return res;
  }


  // get the list of plugins
  this.getPlugins = function() {
    var plgs_len = navigator.plugins.length;
    var plgs = "";
    for(var i = 0;i < plgs_len;i ++) {
      plgs += navigator.plugins[i].name + '_';
    }
    plgs = plgs.replace(/[^a-zA-Z ]/g, "");
    return plgs;
  };

  // check the support of local storage
  this.checkLocalStorage = function() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch(e) {
      return false;
    }
  };

  // get the number of CPU cores
  this.getCPUCores = function() {
    if(!navigator.hardwareConcurrency)
      return "-1"
    else
      return navigator.hardwareConcurrency;
  };

  // check the support of WebGL
  this.getWebGL = function() {
    canvas = getCanvas('tmp_canvas');
    var gl = getGL(canvas);
    return gl;
  }

  // get the inc info
  this.getInc = function(gl) {
    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  }

  // get the GPU info
  this.getGpu = function(gl) {
    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  }

  // get the canvas test information

  var CanvasTest = function() {
    canvasData = "Not supported";
    canvas = $("<canvas height='60' width='400'></canvas>")[0];
    canvasContext = canvas.getContext("2d");
    canvas.style.display = "inline";
    canvasContext.textBaseline = "alphabetic";
    canvasContext.fillStyle = "#f60";
    canvasContext.fillRect(125, 1, 62, 20);
    canvasContext.fillStyle = "#069";
    canvasContext.font = "11pt no-real-font-123";
    canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
    canvasContext.fillStyle = "rgba(102, 204, 0, 0.7)";
    canvasContext.font = "18pt Arial";
    canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
    canvasData = canvas.toDataURL("image/png", 1.0);
    return canvasData;
  }

  this.finished = false;
  this.nextID = 0;
  this.getID = function(){
    if (this.finished) {
      throw "Can't  generate ID anymore";
      return -1;
    }
    return this.nextID ++;
  }

  this.getIDs = function(numIDs) {
    var idList = [];
    for (var i = 0;i < numIDs;++ i) {
      idList.push(this.getID());
    }
    return idList;
  }

  // used for sending images back to server
  this.getData = function(gl, canvas, id) {
    var dataurl = canvas.toDataURL('image/png', 1.0);
    $.ajax({
      context:this,
      url : "http://" + ip_address + "/pictures",
      type : 'POST',
      async: false,
      data : {
        imageBase64: dataurl
      },
      success : function(img_id) {
        this.setGPUTestPostData(calcSHA1(dataurl), id, img_id);
        //parent.postMessage(data,"http://uniquemachine.org");
      },
      error: function (xhr, ajaxOptions, thrownError) {
        //alert(thrownError);
      }
    });
  }

  //this function is used to set the postdata of gpu test
  this.setGPUTestPostData = function(hashValue, id, img_id) {
    this.postData['gpuImgs'][id] = img_id + '_' + hashValue;
  }

  this.getPostData = function() {
    // get every basic features
    this.postData['timezone'] = new Date().getTimezoneOffset();
    this.postData['resolution'] = this.getResolution();
    this.postData['plugins'] = this.getPlugins();
    this.postData['cookie'] = navigator.cookieEnabled;
    this.postData['localstorage'] = this.checkLocalStorage();
    this.postData['adBlock'] = $('#ad')[0] == null ? 'Yes' : 'No';
    cvs_test = CanvasTest();
    this.postData['canvas_test'] = Base64EncodeUrlSafe(calcSHA1(cvs_test.substring(22, cvs_test.length))); //remove the leading words
    this.postData['cpu_cores'] = this.getCPUCores();
    this.postData['audio'] = this.audioFingerPrinting();
    this.postData['langsDetected'] = get_writing_scripts();
    
    // this is the WebGL information part
    this.testGL = this.getWebGL();
    if (this.testGL) this.postData['WebGL'] = true;
    else this.postData['WebGL'] = false;
    this.postData['inc'] = "Not Supported";
    this.postData['gpu'] = "Not Supported";

    if (this.postData['WebGL']) { 
      this.postData['inc'] = this.getInc(this.testGL);
      this.postData['gpu'] = this.getGpu(this.testGL);
    }

    //this part is used for WebGL rendering and flash font detection
    //these two part are async, so we need callback functions here


    this.webglFinished = function() {
      console.log(this.postData);
      this.startSend();
    }

    webGLTest(this);

    //startSend(this.postData);
    console.log(this.postData);
    
    this.startSend = function(){
      $.ajax({
        url : "http://" + ip_address + "/features",
        dataType : "json",
        contentType: 'application/json',
        type : 'POST',
        data : JSON.stringify(this.postData),
        success : function(data) {
          console.log(data);
          parent.postMessage(data,"http://127.0.0.1/uniquemachine/");
          //parent.postMessage(data,"http://uniquemachine.org");
        },
        error: function (xhr, ajaxOptions, thrownError) {
          alert(thrownError);
        }
      });
    }

  }
};

/* Converts the charachters that aren't UrlSafe to ones that are and
   removes the padding so the base64 string can be sent
   */
Base64EncodeUrlSafe = function(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
};

stringify = function(array) {
  var str = "";
  for (var i = 0, len = array.length; i < len; i += 4) {
    str += String.fromCharCode(array[i + 0]);
    str += String.fromCharCode(array[i + 1]);
    str += String.fromCharCode(array[i + 2]);
  }

  // NB: AJAX requires that base64 strings are in their URL safe
  // form and don't have any padding
  var b64 = window.btoa(str);
  return Base64EncodeUrlSafe(b64);
};

function getFingerprint() {
  var collector = new Collector();
  collector.getPostData();
}