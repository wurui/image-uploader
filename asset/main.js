define(['oxjs', './exif', './megapix-image'], function(OXJS, exif, MegaPixImage) {
    var ALLOW_SIZE = 200 * Math.pow(2, 10); //200K?? 好像不行?　500k还都能做到500k以内
    var ALLOW_TYPE_REG = /\.(png|jpg|jpeg)$/i;
    var g_uploading = false;
    var constructor = function(config) {
        this.fileQ = [];
        this.config = config;

    };
    constructor.prototype.addToQ = function(files, fn) {

        var validFiles = [];
        for (var i = 0; i < files.length; i++) {
            var file = this.filterFile(files[i]);

            file && validFiles.push(file);
        }
        var _this = this;

        //  showImages(validFiles);


        this.getImageSrc(validFiles, function(arr) {

            _this.fileQ = _this.fileQ.concat(validFiles);
            fn && fn(validFiles);
        })
        return validFiles;
    };

    constructor.prototype.delFromQ = function(fileId) {
        var fileQ = this.fileQ;
        for (var i = 0; i < fileQ.length; i++) {
            var file = fileQ[i];

            if (file._id == fileId) {

                fileQ.splice(i, 1)

            }
        }
    };
    constructor.prototype.getImageSrc = function(files, opts, fn) {
        if (typeof opts == 'function') {
            fn = opts;
            opts = null;
        }

        var arr = [],
            len = files.length,
            cb = function(data, file) {
                var fileId = file._id;
                arr[file._tmp_index] = {
                        id: fileId,
                        src: data
                    } // Mustache.render(tpl, {id: fileId, src: data});
                delete file._tmp_index;
                file._data = data;
                len--;
                if (!len) {
                    return fn(arr);
                }
            };
        for (var i = 0; i < files.length; i++) {
            files[i]._tmp_index = i;
            this.compressedData(files[i], opts, cb);
        }

    };
    constructor.prototype.getFileData = function(file, fn) {

        var reader = new FileReader()
        reader.onload = function(e) {
            fn(e.target.result, file);

        }
        reader.readAsDataURL(file);
    };
    constructor.prototype.compressedData = function(file, opts, fn) {
        var quality = Math.min(.8, Math.max(ALLOW_SIZE / file.size, .1));
        //var file = fileObj.files['0'];
        //图片方向角 added by lzk
        var Orientation = null;

        if (file) {
            console.log("正在上传,请稍后...");
            var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式
            if (!rFilter.test(file.type)) {
                //showMyTips("请选择jpeg、png格式的图片", false);
                return;
            }
            // var URL = URL || webkitURL;
            //获取照片方向角属性，用户旋转控制
            EXIF.getData(file, function() {
                // alert(EXIF.pretty(this));
                EXIF.getAllTags(this);
                //alert(EXIF.getTag(this, 'Orientation'));
                Orientation = EXIF.getTag(this, 'Orientation');
                //return;
            });

            var oReader = new FileReader();
            oReader.onload = function(e) {
                //var blob = URL.createObjectURL(file);
                //_compress(blob, file, basePath);
                var image = new Image();
                image.src = e.target.result;
                image.onload = function() {
                    var expectWidth = this.naturalWidth;
                    var expectHeight = this.naturalHeight;

                    if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
                        expectWidth = 800;
                        expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
                    } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
                        expectHeight = 1200;
                        expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
                    }
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    canvas.width = expectWidth;
                    canvas.height = expectHeight;
                    ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
                    var base64 = null;
                    var mpImg = new MegaPixImage(image);
                    mpImg.render(canvas, {
                        maxWidth: 800,
                        maxHeight: 1200,
                        quality: quality,
                        orientation: Orientation
                    });
                    base64 = canvas.toDataURL("image/jpeg", .5);

                    //uploadImage(base64);
                    fn(base64, file)
                };
            };
            oReader.readAsDataURL(file);
        }
    }

    //对图片旋转处理 added by lzk www.bcty365.com
    function rotateImg(img, direction, canvas) {
        //alert(img);
        //最小与最大旋转方向，图片旋转4次后回到原方向
        var min_step = 0;
        var max_step = 3;
        //var img = document.getElementById(pid);
        if (img == null) return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错
        var height = img.height;
        var width = img.width;
        //var step = img.getAttribute('step');
        var step = 2;
        if (step == null) {
            step = min_step;
        }
        if (direction == 'right') {
            step++;
            //旋转到原位置，即超过最大值
            step > max_step && (step = min_step);
        } else {
            step--;
            step < min_step && (step = max_step);
        }
        //img.setAttribute('step', step);
        /*var canvas = document.getElementById('pic_' + pid);
         if (canvas == null) {
         img.style.display = 'none';
         canvas = document.createElement('canvas');
         canvas.setAttribute('id', 'pic_' + pid);
         img.parentNode.appendChild(canvas);
         }  */
        //旋转角度以弧度值为参数
        var degree = step * 90 * Math.PI / 180;
        var ctx = canvas.getContext('2d');
        switch (step) {
            case 0:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0);
                break;
            case 1:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, 0, -height);
                break;
            case 2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, -height);
                break;
            case 3:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, 0);
                break;
        }


    };
    constructor.prototype.compressedFileData = function(file, opts, fn) {

        if (typeof opts == 'function') {
            fn = opts;
            opts = null;
        }
        var megafix = new Megapix(file);
        var img = new Image();
        //.8 is mostly ok
        var quality = Math.min(.8, ALLOW_SIZE / file.size); //console.log('quality',quality)
        megafix.render(img, {
            quality: quality
        }, function(e) {
            //console.log('img onload',img.src.length)
            fn(img.src, file);

        });
    };
    constructor.prototype.startUpload = function(conf, fn) {
        if (typeof conf == 'function') {
            fn = conf;
            conf = null;
        }
        if (!this.fileQ.length) {
            return fn() //Popup.alert('Please select a file')
        }
        conf = conf || this.config || {
            oxm: 'image-uploader'
        };

        var onprogress = this.onUploadProgress || null;

        var fileQ = this.fileQ;
        var i = 0,
            result = {
                success: 0,
                error: 0,
                urls: []
            },
            fileRest = OXJS.useREST('file/'+conf.ds_id+'/u/'+encodeURIComponent(conf.uid)).setDevHost('http://dev.openxsl.com/'),
            do_one = function() {
                var file = fileQ[i++];
                if (!file) {
                    return fn(null, result)
                }
                //var fileId = file._id;
                //var $node = $('#' + fileId).attr('data-status', 'processing');
                //var formData = new FormData();
                //formData.append('file',file);
                //console.log('length:',file._data.length)
                /*
                $.ajax({
                    url: 'https://www.openxsl.com/ajax/oxmapi/oxmupload?sid=' + conf.sid + '&oxm=' + (conf.oxm || 'image-uploader'),
                    type: 'POST',
                    data: {
                        base64: file._data
                    },
                    contentType: false,
                    dataType: 'json',
                    //processData: false,
                    success: function (r) {

                        if (r.error) {
                            // st = r.error == 'refused' ? 'refused' : 'error';
                            result.error++;
                        } else {
                            // st = 'done';
                            result.success++;
                            result.urls.push(r && r.data && r.data.cdnName);
                        }

                        if(typeof onprogress=='function'){
                            onprogress({
                                success:!r.error,
                                url: r && r.data && r.data.cdnName
                            });
                        }
                        do_one();
                    }
                });*/
                fileRest.post({
                    oxm:conf.oxm,
                    base64: file._data
                }, function(r) {

                    var cdnName = r && r.message;
                    if (r.error) {
                        // st = r.error == 'refused' ? 'refused' : 'error';
                        result.error++;
                    } else {
                        // st = 'done';
                        result.success++;
                        result.urls.push(cdnName);
                    }

                    if (typeof onprogress == 'function') {
                        onprogress({
                            success: !r.error,
                            url: cdnName
                        });
                    }
                    do_one();
                });
            };
        do_one();


    };
    constructor.prototype.filterFile = function(file) {
        /*
         if (file.size > ALLOW_SIZE) {
         return
         }*/
        if (!ALLOW_TYPE_REG.test(file.name)) {
            return
        }
        var fileQ = this.fileQ;
        for (var i = 0; i < fileQ.length; i++) {
            var fileq = fileQ[i];
            if (fileq.name == file.name && fileq.size == file.size) { //same file
                return
            }
        }
        file._id = 'file' + Math.round(Math.random() * 1000000);
        return file;
    };
    return constructor
})