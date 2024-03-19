class Label{
	canvas_container=document.getElementById("labelDesignerCanvasContainer");
	canvas = new fabric.Canvas('labelDesignerCanvas',{
		backgroundColor:'white',
		fireRightClick: true, // 启用右键，button的数字为3
		stopContextMenu: true, // 禁止默认右键菜单
		//元素对象被选中时保持在当前z轴，不会跳到最顶层
		perPixelTargetFind: false, //这一句说明选中的时候以图形的实际大小来选择而不是以边框来选择
		hasBorders: false,
		preserveObjectStacking: true, // 默认false
		});
	lastMouseX=0;
	lastMouseY=0;
	lastTouchTime=0;
	labelItemCount=0;
	zoomStartScale=1;
	load_from_session(){
		this.set_zoom(1);
		var canvas_json=JSON.parse(sessionStorage.getItem('label_canvas'));
		if(typeof canvas_json === 'object'){
			this.canvas.loadFromJSON(canvas_json);
		}
		this.update_objects_attribute();
		this.set_zoom(1);
	}
	save_to_session(){
		this.fix_objects();
		sessionStorage.setItem('label_canvas',this.get_json_string());
	}
	get_json_string(){
		var origZoom=this.canvas.getZoom();
		this.set_zoom(1);
		this.canvas.renderAll();
		var strJSON=this.canvas.toJSON(['width','height']);
		this.set_zoom(origZoom);
		this.canvas.renderAll();
		return JSON.stringify(strJSON);
	}
	update_objects_attribute(){
		this.labelItemCount=0;
		var _this=this;
		this.canvas.forEachObject(function(obj){
			_this.labelItemCount++;
			if(obj.get('type')=='i-text'){
				item_text_update_attribute(obj);
			}
			var locked=(obj.opacity!=1);
			_this.item_lock_set(obj,locked);
		});
		this.canvas.setWidth(this.canvas.getWidth());
		this.canvas.setHeight(this.canvas.getHeight());
	}
	fix_objects(){
		var _this=this;
		this.canvas.forEachObject(function(obj){
			_this.check_and_fix_obj_bound(obj);
		});
	}
	check_and_fix_obj_bound(obj){
		var x=Math.round(obj.left);
		var y=Math.round(obj.top);
		var w=Math.round(obj.width);
		var h=Math.round(obj.height);
		var angle=obj.angle;
		var x0;
		var x1;
		var y0;
		var y1;
		var cw = this.canvas.getWidth();
		var ch = this.canvas.getHeight();
		if(angle==0){
			x0=x;
			x1=x+w;
			y0=y;
			y1=y+h;
			if(x0<0){obj.left=0;}
			if(x1>cw){obj.left=cw-w;}
			if(y0<0){obj.top=0;}
			if(y1>ch){obj.top=ch-h;}
		}
		else if(angle==90){
			x0=x-h;
			x1=x;
			y0=y;
			y1=y+w;
			if(x0<0){obj.left=h;}
			if(x1>cw){obj.left=cw;}
			if(y0<0){obj.top=0;}
			if(y1>ch){obj.top=ch-w;}
		}else if(angle==180){
			x0=x-w;
			x1=x;
			y0=y-h;
			y1=y;
			if(x0<0){obj.left=w;}
			if(x1>cw){obj.left=cw;}
			if(y0<0){obj.top=h;}
			if(y1>ch){obj.top=ch;}
		}else if(angle==270){
			x0=x;
			x1=x+h;
			y0=y-w;
			y1=y;
			if(x0<0){obj.left=0;}
			if(x1>cw){obj.left=cw-h;}
			if(y0<0){obj.top=w;}
			if(y1>ch){obj.top=ch;}
		}
		//console.log("x:"+x+" y:"+y+" w:"+w+" h:"+h+" r:"+angle);
		//console.log("x0:"+x0+" y0:"+y0+" x1:"+x1+" y1:"+y1);
	}
	limit_object_move_outside(){
		var _this=this;
		this.canvas.on('object:moving', function (e) {
			var obj=e.target;
			_this.check_and_fix_obj_bound(obj);
		});
	}
	enable_auto_save_to_session(){
		var _this=this;
		this.canvas.on('object:modified', function (e) {
			_this.save_to_session();
		})
	}
	enable_obj_delete(){
		var _this=this;
		fabric.util.addListener(document.body, 'keydown', function(event) {
			if (event.keyCode === 46) {	//删除键
				var obj=_this.canvas.getActiveObject();
				var locked=(obj.opacity!=1);
				if(locked){
					mui.toast("内容被锁定，解锁后再删除");
				}else{
					_this.canvas.remove(obj);
					_this.canvas.renderAll();
					_this.save_to_session();
				}
			}
		});
	}
	enable_obj_edit(){
		var _this=this;
		this.canvas.on("touch:drag",function(e){
			if(e.self.state=="up"){
				var now=window.performance.now();
				var interval=now-_this.lastTouchTime;
				_this.lastTouchTime=now;
				if(interval>50&&interval<300){
					var obj=_this.canvas.getActiveObject();
					if(obj){
						if(obj.get('type')=='i-text'){
							var locked=(obj.opacity!=1);
							if(!locked){
								obj.editable=true;
								obj.enterEditing();
							}else{
								mui.toast("内容被锁定，解锁后再编辑");
							}
						}
					}
				}
			}
		});
		/*
		eventjs.add({
			target: this.canvas.upperCanvasEl,
			type: 'longpress',
			delay: 1000,
			listener: function(event, self) {
			}
		});
		*/
	}
	try_move_to(dx,dy){
		var x=parseInt(this.canvas_container.style.left);
		var y=parseInt(this.canvas_container.style.top);
		var orig_x=x;
		var orig_y=y;

		var win=document.getElementById("offCanvasContentScroll");
		var win_rect=win.getBoundingClientRect();
		var win_style=window.getComputedStyle(win);
		var win_x0=win_rect.x+parseInt(win_style.paddingLeft);
		var win_y0=win_rect.y+parseInt(win_style.paddingTop);
		var win_x1=win_rect.right-parseInt(win_style.paddingRight);
		var win_y1=win_rect.bottom-parseInt(win_style.paddingBottom);
		var strWin="win["+win_x0+","+win_y0+","+win_x1+","+win_y1+"]";
		//console.log(strWin);

		var labelElement=document.getElementById("labelDesignerCanvas");
		var label_rect=labelElement.getBoundingClientRect();
		var label_x0=label_rect.x;
		var label_y0=label_rect.y;
		var label_x1=label_rect.right;
		var label_y1=label_rect.bottom;
		var strLabel="label["+label_x0+","+label_y0+","+label_x1+","+label_y1+"]";
		//console.log(strLabel);
		//console.log("x:"+x+","+"y:"+y+" dx:"+dx+" dy:"+dy);
		x+=dx;
		y+=dy;
		if(label_x0>=win_x0&&label_x1<=win_x1){
			x=0;
		}if(label_y0>=win_y0&&label_y1<=win_y1){
			y=0;
		}
		if(label_x0>=win_x0&&label_x1>=win_x1&&dx>=0){
			x=orig_x;
		}
		if(label_x0<=win_x0&&label_x1<=win_x1&&dx<=0){
			x=orig_x;
		}
		if(label_y0>=win_y0&&label_y1>=win_y1&&dy>=0){
			y=orig_y;
		}
		if(label_y0<=win_y0&&label_y1<=win_y1&&dy<=0){
			y=orig_y;
		}
		
		if(label_x0<=win_x0&&label_x1>=win_x1){
			if(dx>=0&&label_x0+dx>=win_x0){
				x=0;
			}
			if(dx<=0&&label_x1+dx<=win_x1){
				x=(win_x1-win_x0)-(label_x1-label_x0);
			}
		}
		if(label_y0<=win_y0&&label_y1>=win_y1){
			if(dy>=0&&label_y0+dy>=win_y0){
				y=0;
			}
			if(dy<=0&&label_y1+dy<=win_y1){
				y=(win_y1-win_y0)-(label_y1-label_y0);
			}
		}
		
		if(((label_x1-label_x0)<=(win_x1-win_x0))&&((label_y1-label_y0)<=(win_y1-win_y0))){
			x=0;
			y=0;
		}
		
		this.canvas_container.style.left=x+"px";
		this.canvas_container.style.top=y+"px";
	}
	get_width(){
		return Math.round(this.canvas.getWidth()/this.canvas.getZoom());
	}
	get_height(){
		return Math.round(this.canvas.getHeight()/this.canvas.getZoom());
	}
	set_new_size(newWidth,newHeight){
		this.canvas.setWidth(newWidth*this.canvas.getZoom());
		this.canvas.setHeight(newHeight*this.canvas.getZoom());
		this.save_to_session();
	}
	update_fonts(){
		this.set_zoom(0.9);
		this.canvas.renderAll();
		this.set_zoom(1);
		this.canvas.renderAll();
	}
	set_zoom(zoom){
		var real_w=this.get_width();
		var real_h=this.get_height();
		
		if (zoom > 3) zoom = 3 // 限制最大缩放级别
		if (zoom < 1/2.5) zoom = 1/2.5 // 限制最小缩放级别
		//mui.toast("touch:"+zoom);
		this.canvas.zoom=zoom;
		this.canvas.setZoom(zoom);
		this.canvas.setWidth(real_w*zoom);
		this.canvas.setHeight(real_h*zoom);
		mui.toast(Math.round(zoom*100)+"%");
	}
	enable_zoom_pan(){
		var _this=this;
		this.canvas.on('touch:gesture', function(e) {
			if (e.e.touches && e.e.touches.length == 2) {
				_this.try_move_to(0,0);
				_this.canvas.panning = true;
				_this.canvas.selection = false;

				if (e.self.state == "start") {
					_this.zoomStartScale = _this.canvas.getZoom();
				}
				var zoom = _this.zoomStartScale * e.self.scale;
				_this.set_zoom(zoom);
				_this.try_move_to(0,0);
			}
		});
		var win=document.getElementById("offCanvasContentScroll");
		win.addEventListener("mousewheel", function(e){
			_this.try_move_to(0,0);
			const delta = e.deltaY // 滚轮，向上滚一下是 -100，向下滚一下是 100
			var zoom=_this.canvas.getZoom();
			zoom *= 0.999 ** delta
			_this.set_zoom(zoom);
			_this.try_move_to(0,0);
		});
		win.addEventListener('touchstart', function(e) {
			if(e.target.id=='labelDesignerCanvasContainer'||e.target.id=='offCanvasContentScroll'){
				_this.canvas.discardActiveObject().renderAll();
			}
		});
		win.addEventListener("click", function(e){
			if(e.target.id=='labelDesignerCanvasContainer'||e.target.id=='offCanvasContentScroll'){
				_this.canvas.discardActiveObject().renderAll();
			}
		});
		//this.canvas.on('mouse:wheel', function (e) {
		//});
		// 鼠标按下事件
		this.canvas.on('mouse:down', function (e) {
			if(_this.canvas.getActiveObject()==null){
				if(e.e.touches!=null){
					_this.lastMouseX=e.e.touches[0].clientX;
					_this.lastMouseY=e.e.touches[0].clientY;
				}
				_this.canvas.panning = true;
				_this.canvas.selection = false;
			}
		});
		// 鼠标抬起事件
		this.canvas.on('mouse:up', function (e) {
			_this.canvas.panning = false;
			_this.canvas.selection = true;
		});
		// 移动画布事件
		this.canvas.on('mouse:move', function (e) {
			if (_this.canvas.panning && e && e.e) {
				var dx=0;
				var dy=0;
				if(e.e.movementX!=undefined&&e.e.movementY!=undefined){
					dx=e.e.movementX;
					dy=e.e.movementY;
				}else if(e.e.touches!=null){
					dx = e.e.touches[0].clientX - _this.lastMouseX;
					dy = e.e.touches[0].clientY - _this.lastMouseY;
					_this.lastMouseX = e.e.touches[0].clientX;
					_this.lastMouseY = e.e.touches[0].clientY;
				}
				if(dx!=0||dy!=0){
					_this.try_move_to(dx,dy);
				}
			}
		});
		this.canvas.on('selection:cleared',function(e){
			var groupConfigItem=document.getElementById('groupConfigItem');
			groupConfigItem.style.display='none';
		});
		this.canvas.on('object:selected', function(e) {
			_this.canvas.panning = false;
		});
	}
	item_lock_set(obj,locked){
		var item_normal_fill_color='rgb(0,0,0)';
		var item_lock_fill_color='rgb(60,60,60)';
		if(locked){
			obj.exitEditing();
			obj.opacity=0.8;
			obj.set('fill',item_lock_fill_color);
			obj.lockMovementX=true;
			obj.lockMovementY=true;
			obj['setControlVisible']('mtr',false);
			obj['setControlVisible']('br',false);
			obj['setControlVisible']('bl',false);
			//obj.hasControls=false;
			obj.editable=false;
			obj['borderColor']='rgb(200,200,200)';
		}else{
			obj.opacity=1;
			obj.set('fill',item_normal_fill_color);
			obj.lockMovementX=false;
			obj.lockMovementY=false;
			obj['setControlVisible']('mtr',true);
			obj['setControlVisible']('br',true);
			obj['setControlVisible']('bl',true);
			//obj.hasControls=true;
			obj.editable=false;
			obj['borderColor']='rgb(178,204,255)';
		}
	}
	enable_control_lock_toggle(eventData, transform){
		var obj=this.canvas.getActiveObject();
		var locked=(obj.opacity!=1);
		label.item_lock_set(obj,!locked);
		label.canvas.renderAll();
		label.save_to_session();
	}
	enable_control_lock_render_icon(){
		return function (ctx, left, top, styleOverride, fabricObject) {
			let size = this.cornerSize;
			var locked=(fabricObject.opacity!=1);
			var str_unlock='\uf09c';
			var str_lock='\uf023';
			ctx.save();
			ctx.translate(left, top);
			ctx.fillStyle = locked?'rgb(200,200,200)':'rgb(178,204,255)';
			ctx.font = "22px FontAwesome";
			ctx.fillText(locked?str_lock:str_unlock,-size / 2+4,size / 2-4);
			ctx.restore();
		};
	}
	enable_control_orign_render_icon(){
		return function (ctx, left, top, styleOverride, fabricObject) {
			let size = this.cornerSize;
			var locked=(fabricObject.opacity!=1);
			ctx.save();
			ctx.translate(left, top);
			ctx.beginPath();
			ctx.fillStyle = locked?'rgb(200,200,200)':'rgb(178,204,255)';
			ctx.arc(0,0, size/2, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		};
	}
	enable_control_delete_action(eventData, transform){
		var obj=this.canvas.getActiveObject();
		var btnArray = ['否', '是'];
		var _this=this;
		mui.confirm('确认要删除对象吗？', '删除对象', btnArray, function(e) {
			if (e.index == 1) {
				_this.canvas.remove(obj);
				_this.save_to_session();
			} else {
			}
		});
	}
	enable_control_delete_render_icon(){
		return function (ctx, left, top, styleOverride, fabricObject) {
			let size = this.cornerSize;
			var locked=(fabricObject.opacity!=1);
			if(!locked){
				ctx.save();
				ctx.translate(left, top);
				ctx.fillStyle = locked?'rgb(200,200,200)':'rgb(178,204,255)';
				ctx.font = "22px FontAwesome";
				ctx.fillText('\uf014',-size / 2,size / 2);
				ctx.restore();
			}
		};
	}
	enable_obj_control_point(){
		fabric.Object.prototype.controls.ml.visible=false;
		//fabric.Object.prototype.controls.tl.visible=false;
		fabric.Object.prototype.controls.mb.visible=false;
		fabric.Object.prototype.controls.mr.visible=false;
		fabric.Object.prototype.controls.mt.visible=false;
		fabric.Object.prototype.controls.bl.visible=false;
		fabric.Object.prototype.controls.tl.visible=false;
		fabric.Object.prototype.controls.tr = new fabric.Control({
			x: 0.5,
			y: -0.5,
			cursorStyle: 'pointer',
			mouseDownHandler: (eventData, transform) => this.enable_control_lock_toggle(eventData, transform),
			render: this.enable_control_lock_render_icon(),
			cornerSize: 20
		});
		fabric.Object.prototype.controls.tl = new fabric.Control({
			x: -0.5,
			y: -0.5,
			render: this.enable_control_orign_render_icon(),
			cornerSize: 4
		});
		fabric.Object.prototype.controls.bl = new fabric.Control({
			x: -0.5,
			y: 0.5,
			cursorStyle: 'pointer',
			mouseDownHandler: (eventData, transform) => this.enable_control_delete_action(eventData, transform),
			render: this.enable_control_delete_render_icon(),
			cornerSize: 20
		});
	}
	load_label_json(content){
		this.set_zoom(1);
		this.canvas.loadFromJSON(content);
		this.update_objects_attribute();
		this.fix_objects();
		this.save_to_session();
		this.set_zoom(1);
	}
	constructor(){
		this.load_from_session();
		this.limit_object_move_outside();
		this.fix_objects();
		this.enable_zoom_pan();
		this.enable_auto_save_to_session();
		this.enable_obj_delete();
		this.enable_obj_edit();
		this.enable_obj_control_point();
		this.canvas.renderAll();
	}
}

var label=new Label();

//mui.toast(label.labelItemCount);

