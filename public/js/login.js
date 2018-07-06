CloudShare=false;
CloudIndex=$.NameSpace.register('CloudIndex');
CloudIndex.Bind=function(){
    CloudIndex.Input.forEach(function () {
        this.onfocus=function () {
            this.parentNode.getElementsByTagName('label')[0].className='Input-Focus';
        };
        this.onblur=function () {
            if(!this.value.length) {
                this.parentNode.getElementsByTagName('label')[0].className = ''
            }
        }
    });
    CloudIndex.PostButton.forEach(function () {
        this.onclick=function () {
            CloudIndex.Post(this)
        }
    });
    CloudIndex.SwitchButton[0].onclick=function () {
        CloudIndex.switch(2)
    };
    CloudIndex.SwitchButton[1].onclick=function () {
        CloudIndex.switch(1)
    };
    CloudIndex.SwitchButton[2].onclick=function () {
        CloudIndex.switch(0)
    };
    CloudIndex.SwitchButton[3].onclick=function () {
        CloudIndex.switch(0)
    };
    CloudIndex.SwitchButton[4].onclick=function () {
        CloudIndex.switch(0)
    };
    if(localStorage.user){
        CloudIndex.Input[0].value=localStorage.user;
        CloudIndex.Input[1].value=localStorage.psw;
        CloudIndex.Input[0].onfocus();
        CloudIndex.Input[1].onfocus();
        CloudIndex.Input[2].click();
    }else{
        localStorage.user=localStorage.psw=null;
    }
};
CloudIndex.switch=function(index,user){
    if(CloudIndex.Pending){
        return false;
    }
    CloudIndex.Main.forEach(function () {
        this.style.display='none';
    });
    CloudIndex.This=CloudIndex.Main[index];
    CloudIndex.Main[index].style.display='block';
    CloudIndex.Head[0].innerHTML=CloudIndex.Text[index].h1;
    CloudIndex.Head[1].innerHTML=CloudIndex.Text[index].tips;
    switch (index) {
        case 0:
            document.title = 'CloudDisk-登录';
            break;
        case 1:
            document.title = 'CloudDisk-注册';
            break;
        case 2:
            document.title = 'CloudDisk-忘记密码';
            break;
        case 3:
            document.title = 'CloudDisk-激活';
            break;
    }
};
CloudIndex.Remember=function (a) {
    if(a.checked){
        localStorage.user=CloudIndex.Input[0].value;
        localStorage.psw=CloudIndex.Input[1].value;
    }else {
        localStorage.user=localStorage.psw=null;
    }
};
CloudIndex.Post=function(a){
    var text='登录';
    var TextArr=[];
    var url=null;
    var data=[];
    TextArr=CloudIndex.This.querySelectorAll('input[index]');
    if(a.innerHTML==='登录'){
        type=0;
        text='登录';
        if(TextArr[0].value === '') {
            $.Toast('请输入用户名');
        }
        if(TextArr[1].value === '') {
            $.Toast('请输入密码');
        }
    }
    else if(a.innerHTML==='创建'){
        type=1;
        text='创建';
        if(TextArr[0].value === '') {
            $.Toast('用户名不能为空');
        }
        if(TextArr[0].value&&TextArr[0].value.length<=2) {
            $.Toast('用户名必须大于2个字符');
        }
        if(TextArr[0].value&&TextArr[0].value.length>12) {
            $.Toast('用户名过长');
        }
        if(TextArr[1].value === '') {
            $.Toast('邮箱地址不能为空');
        }
        if(TextArr[1].value&&!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(TextArr[1].value)) {
            $.Toast('邮箱地址不正确');
        }
        if(TextArr[2].value === '') {
            $.Toast('密码不能为空');
        }
        if(TextArr[3].value === '') {
            $.Toast('验证码不能为空');
        }
    }
    else if(a.innerHTML==='开始'){
        if(TextArr[0].value === '') {
            $.Toast('请输入用户名');
        }
        if(TextArr[1].value === '') {
            $.Toast('请输入密保邮箱');
        }
        if(TextArr[1].value&&!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(TextArr[1].value)) {
            $.Toast('邮箱地址不正确');
        }
        if(TextArr[2].value === '') {
            $.Toast('请输入验证码');
        }
        type=2;
        text='开始';
    }
    else if(a.innerHTML==='激活'){
        if(TextArr[0].value === '') {
            $.Toast('请输入用户名');
        }
        if(TextArr[1].value === '') {
            $.Toast('请输入您的密码');
        }
        if(TextArr[2].value === '') {
            $.Toast('请输入激活码');
        }
        type=3;
        text='激活';
    }
    else{
        return false;
    }
    CloudIndex.Check=true;
    for(var i=0;i<TextArr.length;i++){
        (function (i) {
            if(!TextArr[i].value.length){
                CloudIndex.Check=false;
                var b=TextArr[i];
                TextArr[i].parentNode.style.borderColor='#ED4245';
                setTimeout(function (){
                    b.parentNode.style.borderColor='#eee';
                },'3000');
            }
        })(i);
    }
    if(CloudIndex.Check) {
        CloudIndex.Posting(a);
        if (type === 0) {
            url="/service/user/login";
            data={
                username: TextArr[0].value,
                password: TextArr[1].value
            };
        }
        else if (type === 1) {
            url="/service/user/register";
            data={
                username: TextArr[0].value,
                email: TextArr[1].value,
                password: TextArr[2].value,
                validate: TextArr[3].value
            };
        }
        else if (type === 2){
            url="/service/user/forget";
            data={
                username: TextArr[0].value,
                email: TextArr[1].value,
                validate: TextArr[2].value
            };
        }else{
            url="/service/user/verifyCheck";
            data={
                name:TextArr[0].value,
                pass:TextArr[1].value,
                code:TextArr[2].value
            }
        }
        CloudMain.Ajax({
            url:url,
            data:data,
            success: function (rs) {
                rs=rs[0];
                $.Toast(rs.msg);
                CloudIndex.fail(a, text);
                if(type === 0) {
                    if(rs.state==='success'){
                        CloudIndex.Success(rs);
                    }else{
                        if(rs.msg==='未激活的用户'){
                            $.Toast('查看您的激活邮箱'+rs.email);
                            CloudIndex.switch(3,TextArr[0].value);
                        }
                        TextArr[0].value = TextArr[1].value = '';
                        TextArr[0].onblur();
                        TextArr[1].onblur();
                    }
                }else if(type===1){
                    if(rs.state==='success'){
                        $.Toast('即将前往激活页面');
                        CloudIndex.switch(3,TextArr[0].value);
                    }else{
                        TextArr[3].value = '';
                        TextArr[3].onblur();
                        CloudIndex.PassCode[0].click();
                    }
                }else if(type===2) {
                    if(rs.state==='success'){
                        CloudIndex.switch(0);
                    }else{
                        TextArr[2].value = '';
                        TextArr[2].onblur();
                        CloudIndex.PassCode[1].click();
                    }
                    TextArr[0].value = TextArr[1].value = '';
                }else{
                    if(rs.state==='success'){
                        CloudIndex.switch(0);
                    }else{
                        TextArr[1].value = TextArr[2].value = '';
                        TextArr[1].onblur();
                        TextArr[2].onblur();
                    }
                }
            }
        });
    }
};
CloudIndex.Posting=function(button){
    button.className='CloudIndex-posting';
    button.disabled=true;
    button.innerHTML='正在处理';
    CloudIndex.Pending=true;
};
CloudIndex.fail=function (a,b) {
    CloudIndex.Pending=false;
    a.innerHTML=b;
    a.disabled=false;
    a.removeAttribute('disabled');
    a.className='';
};
CloudIndex.Success=function(rs){
    CloudIndex.Container.className='CloudIndexMain animated zoomOut';
    CloudIndex.LoadingContainer.style.display='block';
    CloudIndex.LoadTips.innerHTML='正在加载用户信息';
    CloudIndex.LoadingImg.onload=function () {
        if(this.complete){
            CloudIndex.LoadTips.innerHTML='用户资源加载中';
        }
    };
    CloudIndex.LoadingImg.src=CloudMain.ServerUrl+'/'+rs.head;
    ipc.send('login-success');
    $("section").remove();
};
CloudIndex.Init=function () {
    CloudIndex.Text=[
        {"h1":"欢迎","tips":"请登录后继续"},
        {"h1":"开始","tips":"创建一个新用户"},
        {"h1":"帮助","tips":"找回您的账号"},
        {"h1":"准备","tips":"激活您的账号"}
    ];
    CloudIndex.Pending=false;
    CloudIndex.resend=true;
    CloudIndex.InputContainer=$(".CloudIndex-Input");
    CloudIndex.Input=$("input");
    CloudIndex.PostButton=$("button[post]");
    CloudIndex.SwitchButton=$("[switch]");
    CloudIndex.Container=$(".CloudIndexMain")[0];
    CloudIndex.Main=$(".CloudIndexForm");
    CloudIndex.This=CloudIndex.Main[0];
    CloudIndex.Head=$(".CloudIndexHead *");
    CloudIndex.PassCode=$(".CloudIndexLeft img");
    CloudIndex.Background=$(".CloudIndexFliter")[0];
    CloudIndex.LoadingContainer=$(".CloudIndexLogining")[0];
    CloudIndex.LoadingImg=$(".CloudIndexLogining img")[0];
    CloudIndex.LoadTips=$('.CloudIndexLogining p')[0];
    CloudIndex.resendBtn=$("#resendBtn")[0];
    CloudIndex.PassCode[0].onclick=CloudIndex.PassCode[1].onclick=function () {
        if($.String.exist(location.origin,'http:')) {
            this.src='service/verifyCode?'+Math.random();
        }else{
            this.src=CloudMain.ServerUrl+'/service/verifyCode?'+Math.random();
        }
    };
    CloudIndex.PassCode[0].click();
    CloudIndex.PassCode[1].click();
    CloudIndex.Main[0].parentNode.onkeydown=function (e){
        var currKey=0,evt=e||window.event;
        currKey=evt.keyCode||evt.which||evt.charCode;
        if (currKey === 32) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
            CloudIndex.This.getElementsByTagName('button')[0].click();
        }
        if(currKey===13) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
            CloudIndex.This.getElementsByTagName('button')[0].click();
        }
    };
    CloudIndex.resendBtn.onclick=function(){
        if(!CloudIndex.resend){
            $.Toast('非法操作');
            return false;
        }
        CloudIndex.resend=false;
        CloudMain.Ajax({
            url:"/service/user/resend",
            data:{
              name:$.String.query().user
            },
            success:function (rs) {
                rs=rs[0];
                $.Toast(rs.msg);
                var time=31;
                var a=setInterval(function () {
                    time--;
                    CloudIndex.resend=false;
                    CloudIndex.resendBtn.innerHTML=time+'s后可重新发送';
                    CloudIndex.resendBtn.style.color='#b8b7b7';
                    if(time===0){
                        CloudIndex.resend=true;
                        CloudIndex.resendBtn.innerHTML='重新发送';
                        CloudIndex.resendBtn.removeAttribute('style');
                        clearInterval(a);
                    }
                },1000);
            }
        })
    };
    CloudIndex.Bind();
    CloudIndex.HeadButton=$("section button");
    CloudIndex.HeadButton[0].onclick=function () {
        ipc.send('login-setting')
    };
    CloudIndex.HeadButton[1].onclick=function () {
        ipc.send('login-mini')
    };
    CloudIndex.HeadButton[2].onclick=function () {
        ipc.send('login-close')
    }
}();