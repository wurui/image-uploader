define(['./main','mustache'], function (Main,Mustache) {

    var tpl_imgfile='<span id="{{id}}" class="imgpreview" style="background-image:url({{src}});"><b class="J_Del btn-x">&times;</b></span>'

    return {
        init:function($mod){
            var uploader=new Main({
                oxm:$mod.attr('ox-mod'),
                uid:$mod.attr('data-uid'),
                ds_id:'e0ee59439b39fcc3'
            });
            $mod.on('change',function(e){

                var tar= e.target;
                var ts=new Date();
                if(tar.type=='file'){
                    var file_id=tar.id;
                    var $lbl=$('label[for='+file_id+']').addClass('loading');
                    uploader.addToQ(tar.files,function(arr){
                        for(var i=0;i<arr.length;i++){
                            $lbl.removeClass('loading').before(Mustache.render(tpl_imgfile,{
                                id:arr[i]._id,
                                src:arr[i]._data
                            }));

                        }

                    });

                }
            });
            $mod.on('click','.J_Del',function(e){
                uploader.delFromQ(e.target.parentNode.id);
                $(e.target.parentNode).remove();
            })
            $('.J_submit',$mod).on('click',function(){
                uploader.startUpload(function(e,r){
                    console.log('okok!!!');
                    if(e){
                        alert(e)
                    }else{
                        alert('ok')
                    }
                })
            })
        }
    }
})

