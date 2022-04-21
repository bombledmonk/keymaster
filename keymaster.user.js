// ==UserScript==
// @name         Digi-Key-Master
// @namespace    http://tampermonkey.net/
// @version      0.1.8.1
// @description  try to take over the world!
// @author       You
// @match        https://www.digikey.com/en/products*
// @icon         https://www.google.com/s2/favicons?domain=digikey.com
// @require      https://code.jquery.com/jquery-3.6.0.js
// @require      https://unpkg.com/darkreader@4.9.44/darkreader.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.hoverintent/1.10.2/jquery.hoverIntent.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @resource     tooltipstercss https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceURL
//
// @noframes
// ==/UserScript==


//changelog
// 0.1.7  adding image hover preview for top results
// 0.1.8.1 fixed HTML datasheet text color

var DLOG = true;
var starttimestamp = Date.now();
var sincelast = Date.now();
var version = GM_info.script.version;
var lastUpdate = '21-APR-22'; // I usually forget this
// var $ = $; //supresses warnings in tampermonkey

(function() {
    'use strict';
    // a('th[data-id="1989"]>div>div>span>div>span')[0].innerHTML = "Part</br>Status";
    // $('div["data-table-0-product-description"]');  /// document.create style g
    // document.create('style')

    GM_addStyle(`
         div[data-testid="data-table-0-product-description"] {white-space: nowrap;}
         th[data-id="-8"],td[data-atag="tr-supplier"] {display:none;}
         td[data-atag="tr-manufacturer"] {
             word-wrap: break-word;
             max-width: 15ch;
         }
         table[data-testid="data-table-0"]>thead>tr>th{
             word-wrap: break-word !important;
             max-width: 15ch;
             white-space:unset;
         }

    `);
    // $('td[data-atag="tr-qtyAvailable"]').each(function(){$(this).innerHTML($(this).text().replace('-','<br>'))}); //keep
    // Your code here...
    $('button[data-testid="sort--8-asc"]').closest('th').attr('data-id','-8');

    // $('table[data-testid="data-table-0"]>thead>tr>th').addclass('.css({'word-wrap': 'break-word', 'max-width': '15ch', 'white-space':'unset'});
    // $('td[data-atag="tr-manufacturer"]').
    runPLP();
    console.log('ran PLP');

    if(window.location.href.includes('detail')){
         waitForKeyElements('#cust-ref-input',runPDP);
         console.log('ran PDP');
    }
    runIndexResults();
    addResourceCSS();

})();

function runPLP(){
        setTimeout ( supplierMatch, 4000);

    descriptionNoWrap();
    hideSupplierCol();
    trimTableWhiteSpace();
    hideCompareText();
    biggerThumbnail();
    addDarkReader();
}

function addResourceCSS() {
    var cssNames = [
        "tooltipstercss",
    ];

    for (var x in cssNames) {
        var thetext = GM_getResourceURL(cssNames[x]);
        _log('style tick 1' + cssNames[x], DLOG);
        $('body').prepend('<link rel="stylesheet" href="' + thetext + '">');
        // $('body').prepend('<link rel="stylesheet" href="data:text/css;base64,'+thetext+'">')
        _log('style tick end' + cssNames[x], DLOG);
        // _log('style tick start '+cssNames[x], DLOG);
    }
}

function configTooltips(){
        $.tooltipster.setDefaults({
        content: '...loading',
        trigger: 'hover',
        delay: 350,
        interactive: true,
        side: 'bottom',
        updateAnimation: null,
        animation: 'fade',
        theme: 'tooltipster-shadow',
    });
}


function addTopResultsPreview(){
    // $('[data-testid="result-top"]')
   $('body').on('mouseenter', '[data-testid="result-top"] img:not(.tooltipstered)', doImageTooltip)
}

function doImageTooltip(){
    // console.log('body entered for tooltip', this);
    $(this).tooltipster({
            content: 'Loading...',
            // content: $('#clipmecontainer:last'),
            'side': 'left',
            'distance': 0,
            'multiple': true,
            'delay': 50,
            'contentCloning': true,
            'functionReady': function (instance, helper) {
                console.log(helper.origin.src);
                instance.content($(helper.origin).clone().height(250).width(250));
                // $('.copyContent').html('<i class="fa fa-files-o"></i> Copy Text')
                // $('.copyContent').attr('data-clipboard-text', $(helper.origin).text().trim());
                // $('.copyFormattedContent').html('<i class="fa fa-files-o"></i> Copy Formatted Link')
                // $('.copyFormattedContent').attr('data-clipboard-text', $(helper.origin).text().trim());
                // // console.log('~~~~~~~~~~~~~~~~~', instance, helper);
                // $(helper.tooltip).find('.tooltipster-content').css('padding', '2px')
                // instance.reposition();
            },
        }).tooltipster('open');
}



function addPDPImageZoom(){
console.log('image style started');

     GM_addStyle(`
                 div[data-testid="carousel-main-image"] img {transition: transform .1s ease-in-out;;
                                                             transform-origin: top left;

                                                            }
                 div[data-testid="carousel-main-image"] img:hover {
                                                                   transform: scale(3);
                                                                   transform-origin: top left;
                                                                   z-index: 100;
                                                                   position:absolute;
                                                                   transition-delay:.250s;
                                                                  }
  `);
console.log('image style added');
}

function addDarkReader(){
    DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10
    });
// Get the generated CSS of Dark Reader returned as a string.
console.log(CSS);
}

function descriptionNoWrap(){
     GM_addStyle(`
         div[ref_page_event="Select Part"]>div {white-space: nowrap;}
    `);
}

function hideSupplierCol(){
    $('button[data-testid="sort--8-asc"]').closest('th').attr('data-id','-8');
    GM_addStyle(`
         th[data-id="-8"],td[data-atag="tr-supplier"] {display:none;}
    `);
}

function trimTableWhiteSpace(){
    //plp table whitespace
    GM_addStyle(`
         th[data-id="-8"],td[data-atag="tr-supplier"] {display:none;}
         td[data-atag="tr-manufacturer"] {
             word-wrap: break-word;
             max-width: 15ch;
         }
         table[data-testid="data-table-0"]>thead>tr>th{
             word-wrap: break-word !important;
             max-width: 15ch;
             white-space:unset;
         }
    `);
}

function supplierMatch(){
    console.log('runing supplier match');
    $('tr[data-testid="data-table-0-row"]').each(function(i,x){
        console.log('row');
        try{

            var supplier = $(x).find('td[data-atag="tr-supplier"] a');
            var manufacturer = $(x).find('td[data-atag="tr-manufacturer"]');
            var qty = $(x).find('td[data-atag="tr-qtyAvailable"]');
            console.log(supplier);
            if (supplier.text().trim() !== manufacturer.text().trim()){
                console.log(supplier.text());
                manufacturer.append('<br>');
                supplier.attr('title', supplier.text());
                supplier.text('🇲 🇵')

                manufacturer.append(supplier.clone());

            }

        }catch(e){}
    });

    GM_addStyle(`
       td[data-atag="tr-qtyAvailable"] a {
          font-size:13px;
          color: gray;
          text-decoration:none;
          text-align:right;
       }
       td[data-atag="tr-qtyAvailable"] div{
          font-size: 13px;
       }
    `);
}

function hideCompareText(){
    GM_addStyle(`
        th[data-id="-99"]>div {display: none;}
        th[data-id="-99"] {min-width:40px !important;}
        table[data-testid="data-table-0"]>thead>tr>th:first-child {min-width:40px;}
    `);
}

function biggerThumbnail(){
     GM_addStyle(`
     img[data-testid="data-table-0-product-image"] {width:64px; height:64px;}
     td[data-atag="tr-product"] div>a>div { width:64px; height:64px;}
     `);
}
// [data-testid="data-table-0"





function runPDP(){
    GM_addStyle(`
    #mfrlogo img {
        filter: invert(60%);
        height: 50px;
    }
    #mfrlogo {
        text-align:center;
    }
    .MuiContainer-maxWidthLg{max-width:1400px;}
    `)
    $('[data-testid="carousel-container"]').prepend('<div id=mfrlogo>');
    var mfrlogohref = $('[data-testid="overview-supplier"] a').attr('href');
    $('#mfrlogo').load(mfrlogohref + ' .smc-logo:first img');
    $('#cust-ref-input')
        .attr('placeholder', 'Your Customer PN or Reference')
        .attr('title','Text is printed on Invoice and Pick Label');
    // $('#cust-ref-input').closest('tr').find('td:first').text("Custom Info");
    $('[data-evg="product-details-overview"] table>tbody').append($('[data-evg="product-details-overview"] table>tbody tr:first'));

    addMoreDocs();
    removeSupplier();
    removeLeadTime();
    removeMFRPN();
    waitForKeyElements('[data-testid="price-and-procure-title"]',doAfterPricingLoad);
    addPDPImageZoom();
    loadHTMLDatasheets();
    //rightAlignCols();
    // waitForKeyElements('[data-testid="price-and-procure-title"]',zeroStockOtherSuppliers);
}

function removeSupplier(){
   GM_addStyle(`
    [data-testid="overview-supplier"] {display:none;}
   `);
}

function removeLeadTime(){
   GM_addStyle(`
    [data-testid="std-lead-time"] {display:none;}
   `);
}

function removeMFRPN(){
    //TODO maybe add an id to the mfr so we don't have to guess its hiding the next row
    // this ides the row after mfr which happens to be mfrpn.
    GM_addStyle(`
        [data-testid="overview-manufacturer"] + tr {display:none;}

    `);
}

function addNonStock(){
    if($('[data-testid="price-and-procure-title"] span').text().startsWith('Available')){
        $('[data-testid="price-and-procure-title"] span').text("Availble to Order - Non-Stock")
    }
}

function rightAlignCols(){
    GM_addStyle(`
    [data-evg="product-details-overview"] table>tbody>tr>td:first-child{
        text-align:right;
        padding-right:15px;
    }
    `);
}

function addMoreDocs(){
    GM_addStyle(`
        .moredocs {
        float:right;
    `);
    $('[data-testid="datasheet-download"]').after('<a class=moredocs href=#docsmedia>');
    $('[data-testid="docs-media-table"]').attr('id', 'docsmedia')
    $('.moredocs').text('(see '+$('[data-testid="docs-media-table"] table tbody a').length +' more docs)')
}

function dimPackaging(){

}

function zeroStockOtherSuppliers(){
    console.log('zero instock with MP suplier')
    if($('[data-testid="other-suppliers-title"]').length){
        GM_addStyle(`
           .othersup {
           font-size: 10pt;
           text-decoration:none;
           }
        `);
        var mpCount = $('[data-testid="alternative-title-qty-msg"]:first>span').text();
        $('[data-testid="other-suppliers-title"]').attr('id', 'othersuppliers');
        $('[data-testid="price-and-procure-title"] span:contains("0 In Stock")')
            .after(`<br><span class=othersup>Marketplace Stock:</span> <span class=othersup>${mpCount}</span> <a class=othersup href=#othersuppliers>View Now</a></span>`);
        $('.othersup').click(function(e){
            simulateMouseClick(document.querySelector('[data-testid="expand-pricing"]'));
            console.log('clicked');
        });
    }
}

function doAfterPricingLoad(){
    addNonStock();
    zeroStockOtherSuppliers();
}


function loadHTMLDatasheets(){
    try{
        // Your code here...
        var htmldatasheet = document.querySelectorAll('a[href*="htmldatasheets"')[0].href;
        console.log(htmldatasheet);

        $('main').append('<div id="htmlds">hello world</div>');
        $('#htmlds').load(htmldatasheet, function(){
            $(this).find('#header,#footer').hide();
        });
        GM_addStyle(`
        .fc0 {color: rgba(13, 8, 0, 0.95) !important;}
        `);
    }catch(e){
        console.log('error loading html datasheet');
    }
}







function runIndexResults(){
    //fix index sidebar
        GM_addStyle(`
          [data-testid="category-link"]>span {font-size:13px;}
          [data-testid="category-link"] {
                                         margin: 0px 0px;
                                         padding: 4px 0px;
                                        }

         [data-testid="categories-title"]+hr+div      {max-height: 100%;}
        `);
   // fix results sidebar
        GM_addStyle(`
          [data-testid^="parent-category-sidecar-"]>span {font-size:13px;}
          [data-testid^="parent-category-sidecar-"] {
                                         margin: 0px 0px;
                                         padding: 4px 0px;
                                        }

         [data-testid="categories-title"]+hr+div      {max-height: 100%;}
        `);
    // fix famiiles
        GM_addStyle(`
          [data-testid="subcategories-items"]>span {
                                                    font-size:14px;
                                                   }
          [data-testid="subcategories-items"]{
                                                 padding: 0px 0px;
                                                 margin: 0px 0px;
                                                }
          [data-testid="subcategories-container"]>li {
                                         margin: 0px 0px;
                                         padding: 0px 0px;
                                        }
          [data-testid="subcategories-items"]>span>span{
                                                       font-size: 12px;
                                                       }
        `);
    // fix category font size
          GM_addStyle(`
             [data-testid^="parent-category-container"]>span {font-size:18px;}
          `);
    // fix top results
          GM_addStyle(`
             [data-testid^="category-card-"]>div>div>div:nth-of-type(2)>div>div:nth-of-type(1) {font-size:13px; padding-bottom:3px;}
             [data-testid^="category-card-"]>div>div>div:nth-of-type(2)>div>div:nth-of-type(3) {font-size:13px; padding-top:2px;}

          `);

   waitForKeyElements('[data-testid="result-top"]', addTopResultsPreview, true);
}






const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
function simulateMouseClick(element){
  mouseClickEvents.forEach(mouseEventType =>
    element.dispatchEvent(
      new MouseEvent(mouseEventType, {
          // view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
      })
    )
  );
}



/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}


// Loging function
function _log(somestring, detailed_logging, textcolor, bgcolor) {
    if (detailed_logging == null) detailed_logging = true;
    try {
        if (detailed_logging == true) { console.log('%c' + (Date.now() - starttimestamp) + 'ms ' + (Date.now() - sincelast) + '[as] ' + somestring, 'background: ' + bgcolor + '; color:' + textcolor + ';'); }
        var sincelast = Date.now();
    }
    catch (err) { }
}


// var script = document.createElement('script');
// script.src= 'https://code.jquery.com/jquery-3.6.0.js';
// document.body.appendChild(script);

//  console.log($('tr[data-testid="data-table-0-row"]').length)

// function supplierMatch(){
//     console.log('runing supplier match');
//     $('tr[data-testid="data-table-0-row"]').each(function(x){
// //         console.log('row');
//         try{

//             var supplier = $(x).find('td[data-atag="tr-supplier"]');
//             var manufacturer = $(x).find('td[data-atag="tr-manufacturer"]');
//             console.log(manufacturer);
//             if (supplier.text().trim() !== manufacturer.text().trim()){
//                 console.log('supplier ', supplier.text());
//             }

//         }catch(e){}
//     });
// }

// supplierMatch()
