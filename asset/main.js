define(['./megapix-image'], function (Megapix) {
    var ALLOW_SIZE = 100 * Math.pow(2, 10);//200K
    var ALLOW_TYPE_REG = /\.(png|jpg|jpeg)$/i;
    var g_uploading = false;

    var constructor = function (config) {
        this.fileQ = [];
        this.config=config;

    };
    constructor.prototype.addToQ = function (files,fn) {

        var validFiles = [];
        for (var i = 0; i < files.length; i++) {
            var file = this.filterFile(files[i]);

            file && validFiles.push(file);
        }
        var _this=this;

        //  showImages(validFiles);



        this.getImageSrc(validFiles,function(arr){

            _this.fileQ = _this.fileQ.concat(validFiles);
            fn && fn(validFiles);
        })
        return validFiles;
    };

    constructor.prototype.delFromQ = function (fileId) {
        var fileQ=this.fileQ;
        for (var i = 0; i < fileQ.length; i++) {
            var file = fileQ[i];

            if (file._id == fileId) {

                fileQ.splice(i, 1)

            }
        }
    };
    constructor.prototype.getImageSrc = function (files,opts,fn) {
        if(typeof opts =='function'){
            fn=opts;
            opts=null;
        }

        var arr = [],
            len = files.length,
            cb = function (data, file) {
                var fileId = file._id;
                arr[file._tmp_index] ={id: fileId, src: data}// Mustache.render(tpl, {id: fileId, src: data});
                delete file._tmp_index;
                file._data=data;
                len--;
                if (!len) {
                    return fn(arr);
                }
            };
        for (var i = 0; i < files.length; i++) {
            files[i]._tmp_index = i;
            this.compressedFileData(files[i],opts, cb);
        }

    };
    constructor.prototype.getFileData = function (file, fn) {

        var reader = new FileReader()
        reader.onload = function (e) {
            fn(e.target.result, file);

        }
        reader.readAsDataURL(file);
    };
    constructor.prototype.compressedFileData = function (file,opts, fn) {

        if(typeof opts=='function'){
            fn=opts;
            opts=null;
        }
        var megafix=new Megapix(file);
        var img=new Image();
        //.8 is mostly ok
        var quality=Math.min(.8,ALLOW_SIZE/file.size);//console.log('quality',quality)
        megafix.render(img,{quality:quality},function (e) {
            //console.log('img onload',img.src.length)
            fn(img.src, file);

        });
    };
    constructor.prototype.startUpload = function (conf,fn) {
        if(typeof conf =='function'){
            fn=conf;
            conf=null;
        }
        if (!this.fileQ.length) {
            return fn()//Popup.alert('Please select a file')
        }
        conf=conf||this.config||{
                oxm:'image-uploader'
            };

        var fileQ=this.fileQ;
        var i = 0,
            result = {
                success: 0,
                error: 0
            },
            do_one = function () {
                var file = fileQ[i++];
                if (!file) {
                    return fn(null,result)
                }
                //var fileId = file._id;
                //var $node = $('#' + fileId).attr('data-status', 'processing');
                //var formData = new FormData();
                //formData.append('file',file);
                console.log('length:',file._data.length)
                $.ajax({
                    url: 'https://www.openxsl.com/ajax/oxmapi/oxmupload?sid='+conf.sid+'&oxm='+(conf.oxm||'image-uploader'),
                    type: 'POST',
                    data: {
                        base64:file._data
                    },
                    contentType: false,
                    //processData: false,
                    success:function (r) {

                        if (r.error) {
                            // st = r.error == 'refused' ? 'refused' : 'error';
                            result.error++;
                        } else {
                            // st = 'done';
                            result.success++;
                        }
                        do_one();
                    }
                });
            };
        do_one();


    };
    constructor.prototype.filterFile = function (file) {
/*
        if (file.size > ALLOW_SIZE) {
            return
        }*/
        if (!ALLOW_TYPE_REG.test(file.name)) {
            return
        }
        var fileQ=this.fileQ;
        for (var i = 0; i < fileQ.length; i++) {
            var fileq = fileQ[i];
            if (fileq.name == file.name && fileq.size == file.size) {//same file
                return
            }
        }
        file._id = 'file' + Math.round(Math.random() * 1000000);
        return file;
    };
    return constructor
})

