var level=1;


$(function game() {
    var elCanvas = $('#graphics');
	var allowedFails = 3;
    var size = picxonix(elCanvas[0], {
        width: 600,
        height: 500,
        nBalls: level,
        nWarders: level,
        speedCursor: 7*level,
        callback: function(iEvent) {
            switch (iEvent) {
                case 0: // animation frame
                    return updateTime();
                case 1: // collision
                    return raiseFaults();
                case 2: // conquer
                    return raiseConquer();
                default:
            }
        },
        callbackOnFrame: true
    });
    if (!size) return;

    var w = size.width, h = size.height;
    elCanvas.css({width: w, height: h});
    console.log(' size(contr)=(%d,%d);',w,h);

    var imagesArray = [
        {"image": "pic1.png"},
        {"image": "pic2.png"},
        {"image": "pic3.png"},
        {"image": "pic4.png"},
        {"image": "pic5.png"},
        {"image": "pic6.png"}
    ];
    var nLevels = imagesArray.length;
	//задаем рандомную картинку на старте
    var tLevel = 0;
    var nTimeLevel = 0;
    var nTimeTotal = 0;
    var nPoints = 0;
    var nFaults = 0;
    var bStarted = false;
	var bPlay = false;
    var oLevel;
    var elTime = $('#status-time');
	
	var restartButtonPositionX = Math.floor((w- 310)/ 2)
	var restartButtonPositionY = Math.floor((h- 60)/ 2);
	var restartBtn = $($('#overlay-restart-template').html())
			.css({left: restartButtonPositionX+'px', top:restartButtonPositionY+'px'})
			.appendTo(elCanvas).hide()
			.click(function(e) {
				e.preventDefault();
				e.stopPropagation();
				//костыль - если нажимаем RELOAD, то страница просто перезагружается.
				location.reload();
			});
	
    preloadLevel();
	startLevel();

    var keyHash = {37: 'left', 39: 'right', 38: 'up', 40: 'down', 80: 'stop'};
    $(document).keydown(function(e) {
        var key = e.which;
        console.log('ON-keydown: key=%d',key);
        if (!bPlay || !(key in keyHash)) return;
        e.preventDefault();
        picxonix('cursorDir', keyHash[key]);
    });
    elCanvas.click(function(e) {
        if (!bPlay) return;
        var pos0 = elCanvas.offset();
        var x = e.pageX, y = e.pageY,
            xc = x - pos0.left, yc = y - pos0.top;
        console.log('ON-click: pos0=(%d,%d); pos(click)=(%d,%d); pos(canvas)=(%d,%d)',pos0.left,pos0.top,x,y,xc,yc);
        picxonix('cursorDir', [xc, yc]);
    });


    function preloadLevel() {
		var randomImageNumber = Math.floor((Math.random() * imagesArray.length));
        oLevel = imagesArray[randomImageNumber];
        var img = new Image();
        img.src = oLevel.image = 'images/'+oLevel.image;
    }

    function startLevel() {
        if (!oLevel) return;
		restartBtn.hide(500);
        if (!bStarted)
            $('.my-panel').removeClass('hidden');
        bStarted = bPlay = true; 
        picxonix('level', oLevel);
        tLevel = Date.now(); 
		nTimeLevel = 0;
    }

    function updateTime() {
        var n = Math.floor((Date.now() - tLevel) / 1000);
        if (n - nTimeLevel < 1) return;
        console.log('updateTime(): nTimeLevel=%d(%d)',n,nTimeLevel);
        nTimeLevel = n;
        function str_pad(s) {
            return Array(3 - s.length).join('0') + s;
        }
        n = nTimeLevel+ nTimeTotal;
        var nm = String(Math.floor(n / 60)), ns = String(n % 60);
        elTime.html(str_pad(nm)+':'+str_pad(ns));
    }

	//Проверка на то, столкнулись ли (Fail)
    function raiseFaults() {
        console.log('raiseFaults():');
        $('#status-faults').html(++nFaults);
        if (nFaults < allowedFails) return;
		//показываем копку Restart, если столкнулись больше, чем allowedFails раз
		restartBtn.show(500);		
        picxonix('end', false);
    }

	//Проверка на то, выиграли ли
    function raiseConquer() {
        var data = picxonix('state');
        console.log('raiseConquer(): data=%o',data);
        if (!data) return false;
        var val = data.cleared;
        console.log(' val=%f',val);
        $('#status-cleared').html(parseFloat(val).toPrecision(2));
        if (val < 85) return false;
        setTimeout(function() {
            picxonix('end', true);
        }, 1000);
        return true;
    }

});
    