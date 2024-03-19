class LabelDesigner{
	menuItemTypeSelect=document.getElementById("menuItemTypeSelect");
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
		if(obj.get('type')=='i-text'){
			item_action_text_set_types(obj,menuItemTypeSelect);
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
		var html='<table style="font-size:16px;border-collapse: separate;border-spacing: 4px;text-align:center;vertical-align: middle;">';
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">宽度</td><td><input type="text" id="inputPageWidth" style="margin:0px;" autofocus value="' + label.get_width() + '"/></td></tr>';
        html=html+'<tr><td style="width:10px;white-space: nowrap;padding-right:10px;">高度</td><td><input type="text" id="inputPageHeight" style="margin:0px;" autofocus value="' + label.get_height() + '"/></td></tr>';
		html=html+"</table>";
		mui.promptEx('标签尺寸','毫米(mm)', btnArray, html, function(e) {
			if (e.index == 1) {
				var newWidth = e.popupElement.querySelector('#inputPageWidth').value;
				var newHeight = e.popupElement.querySelector('#inputPageHeight').value;
				//console.log("newWidth:"+newWidth+" newHeight:"+newHeight);
				label.set_new_size(newWidth,newHeight);
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

