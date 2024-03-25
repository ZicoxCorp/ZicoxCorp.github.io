var printerFonts=[
	{fontFamily:'PrnFnt00',fontName:"思源黑体",fontAsciiOnly:false,fontSizes:[14,18,22,25,26,28,30,32,999]},
	{fontFamily:'PrnFnt10',fontName:"思源宋体",fontAsciiOnly:false,fontSizes:[12,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt09',fontName:"SysFont",fontAsciiOnly:true,fontSizes:[12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,48,999]},
	{fontFamily:'PrnFnt80',fontName:"Font0",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt84',fontName:"Font1",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt88',fontName:"Font2",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt8D',fontName:"Font4",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt90',fontName:"Font5",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt94',fontName:"Font6",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
	{fontFamily:'PrnFnt98',fontName:"Font7",fontAsciiOnly:true,fontSizes:[12,14,16,20,24,28,32,999]},
];
for (let printerFont of printerFonts) {
	new FontFaceObserver(printerFont.fontFamily).load().then(() => {
		label.update_fonts();
		//console.log('字体['+printerFont.fontFamily+']加载成功');
		}).catch(() => {
			mui.toast('字体['+printerFont.fontFamily+']加载失败');
		});
}

function item_text_update_attribute(obj){
	obj.update_attribute=function(obj){
		var step = 90;
		var angle= Math.round(obj.angle/step) * step;
		obj.angle = angle;
		obj.snapAngle = 90;
		obj.flipX = false;
		obj.flipY = false;
		obj.lockScalingFlip=true;
	//	obj.lockScalingX=true;
	//	obj.lockScalingY=true;
	//	obj.lockRotation=true;
		obj['setControlVisible']('mr',false);
		obj['setControlVisible']('mb',false);
		obj['setControlVisible']('br',true);
		obj['setControlVisible']('mtr',true);
		obj.on("scaling", function(e) {
			var fontSizes=[];
			for (let printerFont of printerFonts) {
				if(printerFont.fontFamily==obj.fontFamily){
					fontSizes=printerFont.fontSizes;
				}
			}
			var newFontSize=Math.round(obj.fontSize*obj.scaleX);
			var indexSize=0;
			var diffSizeMin=9999;
			for(let i=0;i<fontSizes.length-1;i++){
				//console.log('diffSizeMin:'+diffSizeMin+' newFontSize:'+newFontSize+' Math.abs(fontSizes[i]-newFontSize):'+Math.abs(fontSizes[i]-newFontSize));
				if(diffSizeMin>Math.abs(fontSizes[i]-newFontSize)){
					diffSizeMin=Math.abs(fontSizes[i]-newFontSize);
					indexSize=i;
				}
			}
			var fontSize=fontSizes[indexSize];
			if(newFontSize>fontSizes[fontSizes.length-2]){
				fontSize=newFontSize;
			}
			if(fontSize<fontSizes[0])fontSize=fontSizes[0];
			//console.log('fontSize:'+fontSize+' fontSizes['+indexSize+']:'+fontSizes[indexSize]);
			obj.fontSize=fontSize;
			obj.scaleX = 1;
			obj.scaleY = 1;
			designer.item_action_display(obj);
		});
		for (let printerFont of printerFonts) {
			if(obj.fontFamily==printerFont.fontFamily){
				obj.fontAsciiOnly=printerFont.fontAsciiOnly;
				break;
			}
		}

		obj.on("editing:exited",function(e){
			obj.editable=false;
		});
	};

	obj.update_attribute(obj);
}

function item_action_text_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	menuItemTypeSelect.options.length = 0;
	for (let printerFont of printerFonts) {
		menuItemTypeSelect.innerHTML+='<option style="font-family: \''+printerFont.fontFamily+'\'" value="'+printerFont.fontFamily+'">'+printerFont.fontName+'</option>';
	}
	menuItemTypeSelect.value = obj.fontFamily;
	item_action_text_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
	
	menuItemTypeSelect.onchange = function(e) {
		const selectedOption = menuItemTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemTypeSelect.selectedIndex=menuItemTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			obj.setFontFamily(selectedOption);
			item_action_text_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
			item_text_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}

function item_action_text_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	//console.log(obj.fontFamily);
	//console.log(printerFonts['obj.fontFamily']);

	menuItemSubTypeSelect.options.length = 0;
	var fontSizes=[];
	for (let printerFont of printerFonts) {
		if(printerFont.fontFamily==menuItemTypeSelect.value){
			fontSizes=printerFont.fontSizes;
		}
	}
	for (let fontSize of fontSizes) {
		var fontSizeStr=fontSize;
		if(fontSizeStr==999)fontSizeStr="custom";
		menuItemSubTypeSelect.innerHTML+='<option value="'+fontSize+'">'+fontSizeStr+'</option>';
	}
	menuItemSubTypeSelect.value = 999;
	for (let fontSize of fontSizes) {
		if(fontSize==obj.fontSize){
			menuItemSubTypeSelect.value = fontSize;
			break;
		}
	}
	menuItemSubTypeSelect.onchange = function(e) {
		var selectedOption = menuItemSubTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemSubTypeSelect.selectedIndex=menuItemSubTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			if(selectedOption==999)selectedOption=fontSizes[fontSizes.length-2];
			obj.setFontSize(selectedOption);
			item_text_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}

function item_text_add()
{
	mui.toast('add_text');
	const text = new fabric.IText('这是一段文本', {
		originX: "left",
        originY: "top",
		left: 100,
		top: 100,
		fontSize: 24,
		fontFamily: printerFonts[0].fontFamily,
		snapAngle:90,
		lockScalingFlip:true,
		fontAsciiOnly:false,
		inverse:false,
	});
	item_text_update_attribute(text);
	label.canvas.add(text);
	label.canvas.renderAll();
	label.save_to_session();
}


