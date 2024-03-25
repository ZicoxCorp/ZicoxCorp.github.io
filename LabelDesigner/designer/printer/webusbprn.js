var deviceUsbPrn = null;
var printerData=
"! 0 200 200 1580 1\r\n"+
"PAGE-WIDTH 1600\r\n"+
"TEXT 思源黑体 50 330 230 废矿物油\r\n"+
"TEXT 思源黑体 50 330 326 HW08\r\n"+
"TEXT 思源黑体 50 330 414 251-001-08\r\n"+
"TEXT 思源黑体 50 888 414 液态\r\n"+
"TEXT 思源黑体 50 330 500 废矿物油 液态危险废物\r\n"+
"TEXT 思源黑体 50 330 715 废矿物油固废危废液态危险废物\r\n"+
"TEXT 思源宋体 50 1258 430 √\r\n"+
"TEXT 思源宋体 50 1255 610 √\r\n"+
"TEXT 思源宋体 50 1488 430 √\r\n"+
"TEXT 思源宋体 50 1485 610 √\r\n"+
"TEXT 思源黑体 50 330 896 注意事项，戴手套操作\r\n"+
"TEXT 思源黑体 50 375 1070  98881234568890123\r\n"+
"TEXT 思源黑体 50 476 1190 上海第一产废企业1\r\n"+
"TEXT 思源黑体 50 550 1286 芝柯测试 156799888881\r\n"+
"TEXT 思源黑体 50 320 1378 2023-07-01\r\n"+
"TEXT 思源黑体 50 900 1378 183kg\r\n"+
"TEXT 思源黑体 50 360 1478 危险废物注意事项备注\r\n"+
"B QR 1230 1200 M 2 U 10\r\n"+
"MA,123456789\r\n"+
"ENDQR\r\n"+
"GAP-SENSE\r\n"+
"FORM\r\n"+
"PRINT\r\n";

class WebUsbPrn{
	deviceUsbPrn=null;
	async open(callback) {
		try {
			console.log('open');
			console.log(navigator);
			const usbVendorId = 0x2405;
			const port = await navigator.serial.requestPort({filters:[{usbVendorId}]});
			await port.open({ baudRate: 115200 });
			this.deviceUsbPrn = port;
			callback(true);
		} catch (error) {
			deviceUsbPrn=null;
			callback(false);
		}
	}
	async close(callback){
		try {
			if(deviceUsbPrn!=null){
				deviceUsbPrn.close().then(callback());
			}
			deviceUsbPrn = null;
		}catch(error){
		}
	}
	
	print(data){
		console.log('print');
		this.open(function(connected){
			console.log('connected:'+connected);
			if(connected){
				this.close(function(){
				});
			}
		});
	}
};

var webUsbPrn=new WebUsbPrn();

function webusbprn_print(data){
	//mui.toast("打印机未连接");
	webUsbPrn.print(data);
}

/*
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', event => {
        let connectButton = document.querySelector("#connectUsbPrn");
        let statusButton = document.querySelector("#readStatusUsbPrn");
        let snButton = document.querySelector("#readSnUsbPrn");
        let printButton = document.querySelector("#printDataUsbPrn");
		
		function onUnexpectedDisconnect(event) {
            if (deviceUsbPrn !== null && deviceUsbPrn.device_ !== null) {
                if (deviceUsbPrn.device_ === event.deviceUsbPrn) {
                    deviceUsbPrn.disconnected = true;
                    onDisconnect();
                    deviceUsbPrn = null;
                }
            }
        }

		function onDisconnect() {
            connectButton.textContent = "连接USB打印机";
            statusButton.disabled = true;
            snButton.disabled = true;
            printButton.disabled = true;
        }
		
		async function printerOpen() {
            try {
				const usbVendorId = 0x2405;
				const port = await navigator.serial.requestPort({filters:[{usbVendorId}]});
				await port.open({ baudRate: 115200 });
				deviceUsbPrn = port;
				connectButton.textContent = '断开USB打印机';
				statusButton.disabled = false;
				snButton.disabled = false;
				printButton.disabled = false;
            } catch (error) {
                onDisconnect();
                throw error;
            }
		}
		
		async function printerClose(){
			deviceUsbPrn.close().then(onDisconnect);
			deviceUsbPrn = null;
		}
		
		async function printerWrite(data){
			var writer = deviceUsbPrn.writable.getWriter();
			await writer.write(data);
			writer.releaseLock();
		}
		
		async function printerRead(readlen){
			let result=new Uint8Array([]);
			var finish=false;
			while (deviceUsbPrn.readable) {
				var reader = deviceUsbPrn.readable.getReader();
				try {
					while (true) {
						const { value, done } = await reader.read();
						if (value) {
							//console.log(value.byteLength);
							//console.log(value);
							var newResult = new Uint8Array(result.length + value.length);
							newResult.set(result);
							newResult.set(value, result.length);
							result=newResult;
							if(result.byteLength>=readlen)finish=true;
						}
						if (done) {
							finish=true;
							break;
						}
						if(finish){
							break;
						}
					}
				} catch (error) {
					console.log(error);
				}
				if (finish) {
					reader.releaseLock();
					break;
				}
			}
			return result;
		}
		
		async function readStatus(){
			const buffer = new Uint8Array([0x1D, 0x99]);
			await printerWrite(buffer);
			const response = await printerRead(4);
			//console.log(response);
			if(response.byteLength==4){
				if(response[0]==0x1D&&response[1]==0x99){
					const status=response[2];
					console.log('status:'+status);
					if(status&0x02){
						alert('打印机纸仓盖未合上');
					}else if(status&0x01){
						alert('打印机缺纸');
					}else{
						alert('打印机状态正常');
					}
					return;
				}
			}
			alert('读取打印机状态失败');
		}

		async function readSn(){
			const buffer = new Uint8Array([0x1F,0x52,0x0D,0x00,0x20,0x01,0x43,0x50,0x55,0x5F,0x49,0x44,0x5F,0x53,0x54,0x52,0x00]);
			await printerWrite(buffer);
			const response = await printerRead(4);
			//console.log(response);
			if(response.byteLength==14){
				if(response[0]==0x20&&response[1]==0x0B){
					var snArray=response.subarray(3,13);
					var sn=new TextDecoder("gbk").decode(snArray);
					console.log('sn:'+sn);
					alert('打印机SN:'+sn);
					return;
				}
			}
			alert('读取打印机状态失败');
		}
		
		async function printData(){
			var enc = new TextEncoder();
			var buffer=enc.encode(printerData);
			//console.log(buffer);
			await printerWrite(buffer);
		}
		
        connectButton.addEventListener('click', function() {
            if (deviceUsbPrn) {
				printerClose();
            } else {
				printerOpen();
            }
        });

        statusButton.addEventListener('click', function() {
            if (deviceUsbPrn) {
				readStatus();
            }
        });

        snButton.addEventListener('click', function() {
            if (deviceUsbPrn) {
				readSn();
            }
        });

        printButton.addEventListener('click', function() {
            if (deviceUsbPrn) {
				printData();
            }
        });

		async function loadConnectedPrinter(){
			const ports = await navigator.serial.getPorts();
			if(ports.length>0){
				deviceUsbPrn=ports[0];
				await deviceUsbPrn.open({ baudRate: 115200 });
				connectButton.textContent = '断开USB打印机';
				statusButton.disabled = false;
				snButton.disabled = false;
				printButton.disabled = false;			}
		}
        // Check if WebUSB is available
        if (typeof navigator.serial !== 'undefined') {
            navigator.usb.addEventListener("disconnect", onUnexpectedDisconnect);
            // Try connecting automatically
			loadConnectedPrinter();
        } else {
            alert('WebUSB not available.');
            connectButton.disabled = true;
        }
    });
})();

*/
