var printerFonts=[
	{fontFamily:'PrnFnt00',fontName:"00.思源黑体",fontAsciiOnly:false},
	{fontFamily:'PrnFnt10',fontName:"10.思源宋体",fontAsciiOnly:false},
	{fontFamily:'PrnFnt09',fontName:"09.SysFont",fontAsciiOnly:true},
	{fontFamily:'PrnFnt80',fontName:"80.Font0",fontAsciiOnly:true},
	{fontFamily:'PrnFnt84',fontName:"84.Font1",fontAsciiOnly:true},
	{fontFamily:'PrnFnt88',fontName:"88.Font2",fontAsciiOnly:true},
	{fontFamily:'PrnFnt89',fontName:"89.Font2",fontAsciiOnly:true},
	{fontFamily:'PrnFnt8C',fontName:"8C.Font4",fontAsciiOnly:true},
	{fontFamily:'PrnFnt8D',fontName:"8D.Font4",fontAsciiOnly:true},
	{fontFamily:'PrnFnt90',fontName:"90.Font5",fontAsciiOnly:true},
	{fontFamily:'PrnFnt91',fontName:"91.Font5",fontAsciiOnly:true},
	{fontFamily:'PrnFnt94',fontName:"94.Font6",fontAsciiOnly:true},
	{fontFamily:'PrnFnt98',fontName:"98.Font7",fontAsciiOnly:true},
];
for (let printerFont of printerFonts) {
	new FontFaceObserver(printerFont.fontFamily).load().then(() => {
		label.update_fonts();
		}).catch(() => {
			mui.toast('字体['+printerFont.fontFamily+']加载失败');
		});
}

function item_text_update_attribute(obj){
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
	obj.on("scaling", function(e) {
		var fontSize=obj.fontSize*obj.scaleX;
		fontSize=Math.round(fontSize);
		if(fontSize<=12)fontSize=12;
		else if(fontSize<=16)fontSize=16;
		else if(fontSize<=24)fontSize=24;
		else if(fontSize<=32)fontSize=32;
		if(fontSize>72)fontSize=72;
		obj.fontSize=fontSize;
		//mui.toast(fontSize);
		obj.scaleX = 1;
		obj.scaleY = 1;
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
}

function item_action_text_set_types(obj,menuItemTypeSelect)
{
	menuItemTypeSelect.options.length = 0;
	for (let printerFont of printerFonts) {
		menuItemTypeSelect.innerHTML+='<option style="font-family: \''+printerFont.fontFamily+'\'" value="'+printerFont.fontFamily+'">'+printerFont.fontName+'</option>';
	}
	menuItemTypeSelect.value = obj.fontFamily;
	menuItemTypeSelect.onchange = function(e) {
		const selectedOption = menuItemTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemTypeSelect.selectedIndex=menuItemTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			obj.setFontFamily(selectedOption);
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
	});
	item_text_update_attribute(text);
	label.canvas.add(text);
	label.canvas.renderAll();
	label.save_to_session();
}


