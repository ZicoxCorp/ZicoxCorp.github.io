function update_page_size(){
	var width_mm=parseInt(document.querySelector('#inputPageWidth1').value);
	var height_mm=parseInt(document.querySelector('#inputPageHeight1').value);
	var dot_per_mm=Math.round(label.canvas.dpi/25.4);
	var width_dot=width_mm*dot_per_mm;
	var height_dot=height_mm*dot_per_mm;
	document.querySelector('#inputPageWidth').innerHTML=width_dot;
	document.querySelector('#inputPageHeight').innerHTML=height_dot;
}

class LabelDesigner{
	menuItemTypeSelect=document.getElementById("menuItemTypeSelect");
	menuItemSubTypeSelect=document.getElementById("menuItemSubTypeSelect");
	groupConfigItem=document.getElementById('groupConfigItem');
	item_action_init(){
		var _this=this;
		label.canvas.on("selection:created", function(e) {
			if (e?.selected && e?.selected.length > 1) {
				//canvas.discardActiveObject();
			} else {
				const selectTarget = e?.selected[0];
				_this.item_action_display(selectTarget);
			}
		});
		label.canvas.on("selection:updated", function(e) {
			if (e?.selected && e?.selected.length > 1) {
				//canvas.discardActiveObject();
			} else {
				const selectTarget = e?.selected[0];
				_this.item_action_display(selectTarget);
			}
		});
	}
	item_action_display(obj){
		console.log(obj.get('type'));
		if(obj.get('type')=='Bitmap'){
			menuItemTypeSelect.style.visibility='hidden';
			menuItemSubTypeSelect.style.visibility='hidden';
		}else{
			menuItemTypeSelect.style.visibility='';
			menuItemSubTypeSelect.style.visibility='';
		}
		if(obj.get('type')=='i-text'){
			item_action_text_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
		}
		if(obj.get('type')=='Barcode1D'){
			item_action_barcode1d_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
		}
		if(obj.get('type')=='Barcode2D'){
			item_action_barcode2d_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
		}
		if(obj.get('type')=='rect'){
			item_action_box_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
		}
		if(obj.get('type')=='line'){
			item_action_line_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
		}
		this.groupConfigItem.style.display='block';
	}
	import_label(){
		loadFileFrom('Label File','.label,.cpcl,.zpl,.tspl',this.on_load_label);
	}
	outport_label(){
		var label_json=label.get_json_string();
		//console.log(label_json);
		saveFileTo('Label File','.label',label_json);
	}
	on_load_label(file,content){
		var fileExt=file.name.split('.').pop().toLowerCase();
		if(fileExt=="label")label.load_label_json(content);
	}
	set_label_size(){
		var btnArray = ['取消', '确定'];
		console.log("instruction:"+label.canvas.instruction);
		var html='<table style="font-size:16px;border-collapse: separate;border-spacing: 4px;text-align:center;vertical-align: middle;">';
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">指令</td><td>'
			+'<select id="menuItemInstructionSelect" class="mui-btn" style="width:96px;margin-top:1px;" readonly="readonly" onfocus="this.defaultIndex=this.selectedIndex;">'
			+'<option value="CPCL" '+(label.canvas.instruction=='CPCL'?'selected':'')+'>CPCL</option>'
			+'<option value="ZPL" '+(label.canvas.instruction=='ZPL'?'selected':'')+'>ZPL</option>'
			+'<option value="EPL" '+(label.canvas.instruction=='EPL'?'selected':'')+'>EPL</option>'
			+'<option value="TSPL" '+(label.canvas.instruction=='TSPL'?'selected':'')+'>TSPL</option>'
			+'</select>'
			+'</td><td></td></tr>';
		var dot_per_mm=Math.round(label.canvas.dpi/25.4);
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">DPI</td><td>'
			+'<select id="menuItemDpiSelect" class="mui-btn" style="width:96px;margin-top:1px;" readonly="readonly" onfocus="this.defaultIndex=this.selectedIndex;">'
			+'<option value="203" selected>'+label.canvas.dpi+'</option>'
			+'</select>'
			+'</td><td></td></tr>';
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">宽度</td>'
			+'<td><input type="text" id="inputPageWidth1" style="margin:0px;" autofocus value="' + Math.round(label.get_width()/dot_per_mm) + '" '
			+'oninput="update_page_size();"/></td>'
			+'<td><span id="inputPageWidth">'+label.get_width()+'</span>dot</td>'
			+'</tr>';
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">高度</td>'
			+'<td><input type="text" id="inputPageHeight1" style="margin:0px;" autofocus value="' + Math.round(label.get_height()/dot_per_mm) + '" '
			+'oninput="update_page_size();"/></td>'
			+'<td><span id="inputPageHeight">'+label.get_height()+'</span>dot</td>'
			+'</tr>';
		html=html+"</table>";
		mui.promptEx('标签尺寸','毫米(mm)', btnArray, html, function(e) {
			if (e.index == 1) {
				var instruction=e.popupElement.querySelector('#menuItemInstructionSelect').value;
				var newWidth = e.popupElement.querySelector('#inputPageWidth').innerHTML;
				var newHeight = e.popupElement.querySelector('#inputPageHeight').innerHTML;
				console.log(newWidth);
				console.log("instruction:"+instruction+" newWidth:"+newWidth+" newHeight:"+newHeight);
				label.canvas.instruction=instruction;
				label.set_new_size(newWidth,newHeight);
				label.save_to_session();
				//console.log(document.getElementById("inputPageWidth"));
				//mui.toast('谢谢你的评语：' + e.value);
			} else {
			}
		})
	}
	
	constructor(){
		this.item_action_init();
	}
}
var designer=new LabelDesigner();

async function saveFileTo(title,fileExt,content) {
	try {
			const handle = await window.showSaveFilePicker({types: [{description:title,accept: {'text/json':[fileExt]}}]});
			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
			mui.toast('文件保存成功');
	} catch (error) {
		mui.toast('文件保存失败:', error);
	}
}

function loadFileFrom(title,fileExt,onLoad) {
    let input = document.createElement('input');
    input.value = title;
    input.type = 'file';
	input.accept = fileExt;
    input.onchange = event => {
        let file = event.target.files[0];
        let file_reader = new FileReader();
        file_reader.onload = () => {
            let fc = file_reader.result;
            //console.log(fc);
			onLoad(file,fc);
        };
        file_reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

