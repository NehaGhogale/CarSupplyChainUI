var batchNo;
window.addEventListener('load', function () {
  batchNo = $("#batchNo").val();

  if (batchNo != "" || batchNo != null || batchNo != undefined) {

    getCultivationData(globMainContract, batchNo, function (result) {
      var parentSection = $("#cultivationSection");
      var activityName = "PerformCultivation";
      var built = buildCultivationBlock(result);

      populateSection(parentSection, built, activityName, batchNo)
    });

    getFarmInspectorData(globMainContract, batchNo, function (result) {

      var parentSection = $("#qualityInspectorSection");
      var activityName = "DoneInspection";
      var built = buildQualityInspectorBlock(result);

      populateSection(parentSection, built, activityName, batchNo);
    });

    getManufacturerData(globMainContract, batchNo, function (result) {

      var parentSection = $("#manufacturerSection");
      var activityName = "DoneHarvesting";
      var built = buildManufacturerBlock(result);

      populateSection(parentSection, built, activityName, batchNo);
    });

    getExporterData(globMainContract, batchNo, function (result) {

      var parentSection = $("#exporterSection");
      var activityName = "DoneExporting";
      var built = buildExporterBlock(result);

      populateSection(parentSection, built, activityName, batchNo);
    });

    getImporterData(globMainContract, batchNo, function (result) {

      var parentSection = $("#importerSection");
      var activityName = "DoneImporting";
      var built = buildImporterBlock(result);

      populateSection(parentSection, built, activityName, batchNo);
    });

    getDeliveryHubData(globMainContract, batchNo, function (result) {
      var parentSection = $("#deliveryHubSection");
      var activityName = "DoneProcessing";
      var built = buildDeliveryHubBlock(result);

      populateSection(parentSection, built, activityName, batchNo);

      $('.qr-code-magnify').magnificPopup({
        type: 'image',
        mainClass: 'mfp-zoom-in'
      });

    });
  }

});

function populateSection(parentSection, built, activityName, batchNo) {
  if (built.isDataAvail == true) {
    getActivityTimestamp(activityName, batchNo, function (resultData) {

      if (resultData.dataTime) {
        var phoneNoSec = '';
        if (resultData.contactNo != '-') {
          phoneNoSec = `<i class="fa fa-phone"></i> ` + resultData.contactNo + `<br/>`;
        }

        var userAddress = resultData.user;
        if ($(window).width() <= 565) {
          userAddress = userAddress.substring(0, 15) + '...';
        }

        var refLink = 'https://app.tryethernal.com/transaction/' + resultData.transactionHash;
        var html = `<span class="text-info"><i class='fa fa-user'> </i>
                        `+ resultData.name + ` (` + userAddress + `) <br/>
                        `+ phoneNoSec + `
                    </span>
                    <i class='fa fa-clock-o'> </i> `+ resultData.dataTime.toLocaleString() + `
                    <a href='`+ refLink + `' target='_blank'><i class='fa fa-external-link text-danger'></i></a>
                   `;
        $(parentSection).find(".activityDateTime").html(html);
        $(parentSection).find(".timeline-body .activityData").append('<img src="plugins/images/verified.jpg" alt="user-img" style="width:80px;height:80px" class="img-circle pull-right">');
      }

      if (resultData.transactionHash) {
        var url = 'https://app.tryethernal.com/transaction/' + resultData.transactionHash;
        var qrCode = 'https://chart.googleapis.com/chart?cht=qr&chld=H|1&chs=400x400&chl=' + url;
        var qrCodeSec = `<a href="` + qrCode + `" title="` + resultData.transactionHash + `" class="qr-code-magnify pull-right" data-effect="mfp-zoom-in">
                          <img src="`+ qrCode + `" class="img-responsive" style="width:70px; height:70px; margin-top:-75px;"/>
                        </a>`;

        $(parentSection).find(".activityQrCode").html(qrCodeSec);
      }
    });

    var tmpTimelineBadge = $(parentSection).prev(".timeline-badge");


    $(tmpTimelineBadge).removeClass("danger").addClass("success");
    $(tmpTimelineBadge).find("i").removeClass().addClass("fa fa-check");
  }


  $(parentSection).find(".activityData").html(built.html);
}

function getActivityTimestamp(activityName, batchNo, callback) {
  globMainContract.getPastEvents(activityName, {
    fromBlock: 0,
    filter: { batchNo: batchNo }
  }, function (error, eventData) {
    try {
      web3.eth.getBlock(eventData[0].blockNumber, function (error, blockData) {
        var resultData = {};
        var date = blockData.timestamp;
        /* Convert Seconds to Miliseconds */
        date = new Date(date * 1000);
        // $("#cultivationDateTime").html("<i class='fa fa-clock-o'> </i> " + date.toLocaleString());

        resultData.dataTime = date;
        resultData.transactionHash = eventData[0].transactionHash;

        var userAddress = eventData[0].returnValues.user;
        getUserDetails(globUserContract, userAddress, function (result) {
          if (userAddress == globAdminAddress) {
            resultData.name = 'Admin';
            resultData.contactNo = '-';
          } else {
            resultData.name = result.name;
            resultData.contactNo = result.contactNo;
          }

          resultData.user = userAddress;

          callback(resultData);
        });
      })
    }
    catch (e) {
      callback(false);
    }
  });
}

function buildCultivationBlock(result) {
  var cultivationData = {};
  var registrationNo = result.registrationNo;
  var farmerName = result.farmerName;
  var farmAddress = result.farmAddress;
  var exporterName = result.exporterName;
  var importerName = result.importerName;

  if (registrationNo != '' && farmerName != '' && farmAddress != '' && exporterName != '' && importerName != '') {
    cultivationData.html = `<tr>
                                <td><b>Registration No:</b></td>
                                <td>`+ registrationNo + ` <i class="fa fa-check-circle verified_info"></i></td>
                            </tr>
                            <tr>
                                <td><b>Supplyer Name:</b></td>
                                <td>`+ farmerName + ` <i class="fa fa-check-circle verified_info"></i></td>
                            </tr>
                            <tr>
                                <td><b>Supplyer Address:</b></td>
                                <td>`+ farmAddress + ` <i class="fa fa-check-circle verified_info"></i></td>
                            </tr>
                            <tr>
                                <td><b>Raw Material Name:</b></td>
                                <td>`+ exporterName + ` <i class="fa fa-check-circle verified_info"></i></td>
                            </tr>
                            <tr>
                                <td><b>Raw Material Quantity:</b></td>
                                <td>`+ importerName + ` <i class="fa fa-check-circle verified_info"></i></td>
                            </tr>`;

    cultivationData.isDataAvail = true;
  } else {
    cultivationData.html = ` <tr>
                                    <td colspan="2"><p>Information Not Avilable</p></td>
                            </tr>`;

    cultivationData.isDataAvail = false;
  }

  return cultivationData;
}

function buildQualityInspectorBlock(result) {
  var farmInspactorData = {};
  var productFamily = result.productFamily;
  var typeOfSeed = (result.typeOfSeed === "Accept") ? ('<span class="green">' + result.typeOfSeed + '</span>') : ('<span class="red">' + result.typeOfSeed + '</span>');
  var fertilizerUsed = result.fertilizerUsed;

  if (productFamily != '' && typeOfSeed != '' && fertilizerUsed != '') {

    farmInspactorData.html = `<tr>
                                    <td><b>Procurement Status:</b></td>
                                    <td>`+ typeOfSeed + ` <i class="fa fa-check-circle verified_info"></i></td>
                                  </tr>
                                  <tr>
                                    <td><b>Procurement Accept/Reject Reasons:</b></td>
                                    <td>`+ productFamily + ` <i class="fa fa-check-circle verified_info"></i></td>
                                  </tr>
                                  <tr>
                                    <td><b>Specifications(If Any):</b></td>
                                    <td>`+ fertilizerUsed + ` <i class="fa fa-check-circle verified_info"></i></td>
                                  </tr>`;
    farmInspactorData.isDataAvail = true;
  } else {
    farmInspactorData.html = `<tr>
	                                    <td colspan="2"><p>Information Not Avilable</p></td>
	                            </tr>`;
    farmInspactorData.isDataAvail = false;
  }

  return farmInspactorData;
}

function buildManufacturerBlock(result) {
  var manufacturerData = {};
  var cropVariety = result.cropVariety;
  var temperatureUsed = result.temperatureUsed;
  var humidity = result.humidity;

  if (cropVariety != '' && temperatureUsed != '' && humidity != '') {
    manufacturerData.html = `<tr>
                                <td><b>Product Name:</b></td>
                                <td>`+ cropVariety + ` <i class="fa fa-check-circle verified_info"></i></td>
                              </tr>
                              <tr>
                                <td><b>Product Quantity:</b></td>
                                <td>`+ temperatureUsed + ` <i class="fa fa-check-circle verified_info"></i></td>
                              </tr>
                              <tr>
                                <td><b>Specifications:</b></td>
                                <td>`+ humidity + ` <i class="fa fa-check-circle verified_info"></i></td>
                              </tr>`;
    manufacturerData.isDataAvail = true;
  } else {
    manufacturerData.html = `<tr>
                                    <td colspan="2"><p>Information Not Avilable</p></td>
                        </tr>`;
    manufacturerData.isDataAvail = false;
  }

  return manufacturerData;
}

function buildExporterBlock(result) {
  var exporterData = {};
  var quantity = result.quantity;
  var destinationAddress = result.destinationAddress;
  var shipName = result.shipName;
  var shipNo = result.shipNo;
  var departureDateTime = result.departureDateTime;
  var estimateDateTime = result.estimateDateTime;
  var exporterId = result.exporterId;

  if (quantity != '' && destinationAddress != '' && shipName != '' && shipNo != '' && departureDateTime != '' && estimateDateTime != '' && exporterId != '') {

    var departureDateTime = new Date(result.departureDateTime * 1000).toLocaleString();
    var estimateDateTime = new Date(result.estimateDateTime * 1000).toLocaleString();
    exporterData.html = `<tr>
    <td><b>Ship Name:</b></td>
    <td>`+ shipName + ` <i class="fa fa-check-circle verified_info"></i></td>
  </tr>
  <tr>
    <td><b>Ship No:</b></td>
    <td>`+ shipNo + ` <i class="fa fa-check-circle verified_info"></i></td>
  </tr> 
  <tr>
                            <td><b>Quantity:</b></td>
                            <td>`+ quantity + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Destination Address:</b></td>
                            <td>`+ destinationAddress + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          
                          <tr>
                            <td><b>Departure Date Time:</b></td>
                            <td>`+ departureDateTime + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Estimate Date Time:</b></td>
                            <td>`+ estimateDateTime + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          `;
    exporterData.isDataAvail = true;
  } else {
    exporterData.html = ` <tr>
                                    <td colspan="2"><p>Information Not Avilable</p></td>
                        </tr>`;
    exporterData.isDataAvail = false;
  }

  return exporterData;
}

function buildImporterBlock(result) {
  var importerData = {};
  var quantity = result.quantity;
  var shipName = result.shipName;
  var shipNo = result.shipNo;
  var arrivalDateTime = result.arrivalDateTime;
  var transportInfo = result.transportInfo;
  var warehouseName = result.warehouseName;
  var warehouseAddress = result.warehouseAddress;
  var importerId = result.importerId;

  if (quantity != '' && shipName != '' && shipNo != '' && arrivalDateTime != '' && transportInfo != '' && warehouseName != '' && warehouseAddress != '' && importerId != '') {

    var arrivalDateTime = new Date(result.arrivalDateTime * 1000).toLocaleString();
    importerData.html = `<tr>
    <td><b>Ship No:</b></td>
    <td>`+ shipNo + ` <i class="fa fa-check-circle verified_info"></i></td>
  </tr><tr>
    <td><b>Ship Name:</b></td>
    <td>`+ shipName + ` <i class="fa fa-check-circle verified_info"></i></td>
  </tr>
  <tr>
                            <td><b>Quantity:</b></td>
                            <td>`+ quantity + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          
                          
                          <tr>
                            <td><b>Arrival Date Time:</b></td>
                            <td>`+ arrivalDateTime + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Transport Info:</b></td>
                            <td>`+ transportInfo + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Warehouse Name:</b></td>
                            <td>`+ warehouseName + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Warehouse Address:</b></td>
                            <td>`+ warehouseAddress + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Importer Id:</b></td>
                            <td>`+ importerId + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>`;
    importerData.isDataAvail = true;
  } else {
    importerData.html = ` <tr>
                                    <td colspan="2"><p>Information Not Avilable</p></td>
                        </tr>`;
    importerData.isDataAvail = false;
  }

  return importerData;
}

function buildDeliveryHubBlock(result) {
  var deliveryHubData = {};
  var quantity = result.quantity;
  var temperature = result.temperature;
  var rostingDuration = result.rostingDuration;
  var internalBatchNo = result.internalBatchNo;
  var packageDateTime = result.packageDateTime;
  var deliveryHubName = result.deliveryHubName;
  var deliveryHubAddress = result.deliveryHubAddress;

  if (quantity != '' && temperature != '' && rostingDuration != '' && internalBatchNo != '' && packageDateTime != '' && deliveryHubName != '' && deliveryHubAddress != '') {

    var packageDateTime = new Date(result.packageDateTime * 1000).toLocaleString();

    deliveryHubData.html = `<tr>
                            <td><b>Quantity:</b></td>
                            <td>`+ result.quantity + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Processed Batch No:</b></td>
                            <td>`+ result.internalBatchNo + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Package Date Time:</b></td>
                            <td>`+ new Date(result.packageDateTime * 1000).toLocaleString() + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>DeliveryHub Name:</b></td>
                            <td>`+ result.deliveryHubName + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>
                            <td><b>Warehouse Address:</b></td>
                            <td>`+ result.deliveryHubAddress + ` <i class="fa fa-check-circle verified_info"></i></td>
                          </tr>
                          <tr>`;
    deliveryHubData.isDataAvail = true;
  } else {
    deliveryHubData.html = ` <tr>
                                    <td colspan="2"><p>Information Not Avilable</p></td>
                        </tr>`;
    deliveryHubData.isDataAvail = false;
  }

  return deliveryHubData;
}