// ==UserScript==
// @name         Digi-Key-Master
// @namespace    https://hest.dev
// @version      0.1.9.7
// @description  An Augmentation for Digi-Key's new search
// @author       Ben Hest
// @match        https://www.digikey.com/en/products*
// @icon         https://www.google.com/s2/favicons?domain=digikey.com
// @require      https://code.jquery.com/jquery-3.6.0.js
// @require      https://unpkg.com/darkreader@4.9.44/darkreader.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.hoverintent/1.10.2/jquery.hoverIntent.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/js/tooltipster.bundle.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/jquery.mark.es6.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @resource     tooltipstercss https://cdnjs.cloudflare.com/ajax/libs/tooltipster/4.2.8/css/tooltipster.bundle.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @downloadURL  https://github.com/bombledmonk/keymaster/raw/master/keymaster.user.js
//
// @noframes
// ==/UserScript==


//changelog
// 0.1.7  adding image hover preview for top results
// 0.1.8.1 fixed HTML datasheet text color
// 0.1.8.2  hover pdp attributes
// 0.1.8.3  added partially working category count, results count formatting
// 0.1.8.4 changed some meta info mostly
// 0.1.8.5 added version to header logo for now
// 0.1.9.0 added family image hover, fixed dynamic category count
// 0.1.9.1 added PLP price hover
// 0.1.9.3 added compacted PLP, removed price hover
// 0.1.9.4 fixed up text highlighting
// 0.1.9.5 fixed more docs count
// 0.1.9.6 changed :visited link color
// 0.1.9.7 fixed index image hover


//TODO  Add dynamic top results image preview
//TODO think about n-level highlighting
//TODO add dynamic family info on hover
//TODO expand on dynamic family info hover
//TODO maybe add price break helper/optimizer
//TODO move nlevel product count to the right.
//TODO move HTML Datasheet links next to datasheet links



// Tip for anyone else who wants to Understand the data-containing objects on the DK webpage
// The __NEXT_DATA__ script contains the javascript object with all the data needed for a given webpage.
// Each page, Index/Results, PDP (detail page), and PLP (filters page) have different data models, they can be
// explored by pasting the following two lines in the console:

// var pagedata = __NEXT_DATA__.props.pageProps.envelope.data;
// console.log(pagedata);



var DLOG = true;
var starttimestamp = Date.now();
var sincelast = Date.now();
var version = GM_info.script.version;
var lastUpdate = '30-JAN-23'; // I usually forget this
// var $ = $; //supresses warnings in tampermonkey

(function() {
    'use strict';
    // a('th[data-id="1989"]>div>div>span>div>span')[0].innerHTML = "Part</br>Status";
    // $('div["data-table-0-product-description"]');  /// document.create style g
    // document.create('style')
    $('.header__logo').attr('title', "Keymaster version "+version)
    GM_addStyle(`
         div[data-testid="data-table-0-product-description"] {white-space: nowrap;}
         th[data-id="-8"],td[data-atag="tr-supplier"] {display:none;}
         td[data-atag="tr-qtyAvailable"]>div {min-width:60px;}
         td[data-atag="tr-manufacturer"] {
             word-wrap: break-word;
             max-width: 15ch;
         }
         table[data-testid="data-table-0"]>thead>tr>th{
             word-wrap: break-word !important;
             max-width: 15ch;
             white-space:unset;
             text-align:center;
         }

         table[data-testid="data-table-0"]>thead>tr>th>div {
             justify-content: center
         }
         section[data-testid="filter-page"]>div>section>div { margin-top:2px;}
         hr { display:none;}
         body a:visited {color:#ac96ac;}
    `);
    // $('td[data-atag="tr-qtyAvailable"]').each(function(){$(this).innerHTML($(this).text().replace('-','<br>'))}); //keep

    $('[data-testid="per-page-selector-container"]').parent().parent().parent().css('padding','8px 16px');
    $('[data-testid="filter-common-0"]').parent().parent().css('padding', '6px 16px');
    // Your code here...
    $('button[data-testid="sort--8-asc"]').closest('th').attr('data-id','-8');


    GM_addStyle(`[data-testid="price-quantity-input-container"] {
                                                                  margin-left: 440px;
                                                                  position:absolute;
                                                                  }`); // nudge pricing quatntity box
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
    redrawCategoryPage();
    addHighlighting();
    // console.log('nextdata here zzz', __NEXT_DATA__.props.pageProps.envelope.data.filters);
})();

function runPLP(){
        setTimeout ( supplierMatch, 4000);

    descriptionNoWrap();
    hideSupplierCol();
    trimTableWhiteSpace();
    hideCompareText();
    biggerThumbnail();
    //addPLPPricingHover();
    moveSearchWithin();
    moveFilterToggle();
    widerColumns();
    hidePackageCol();
    addAddToCartButtonPLP();
    try{
    addDarkReader();
    }catch(e){}
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

// function l(){console.log(console.info(arguments.callee))};

function widerColumns(){
    GM_addStyle(`th[data-id="884"] {min-width:145px;} `);  // Surface Mount Land Size
}

function addAddToCartButtonPLP(){
    var intervalId = setInterval(function() {
        if ($('#compare-button-wrapper').is(':visible')) {
            clearInterval(intervalId);
            var compareButton = $('#compare-button-wrapper button');
            var addToCartButton = $('<a id="add-to-cart-btn" class="MuiButtonBase-root MuiButton-root jss62 MuiButton-contained MuiButton-containedPrimary" tabindex="0" type="button"><span class="MuiButton-label">Add to cart</span></a>');
            addToCartButton.insertAfter(compareButton);
        }
    }, 500);

    $('table').on('change', 'input[type="checkbox"]', function() {
        var checked = $('table input[type="checkbox"]:checked');
        if (checked.length > 0) {
            var url = 'https://www.digikey.com/classic/ordering/fastadd.aspx?';
            checked.each(function(i) {
                var row = $(this).closest('tr');
                var partNumber = row.find('a[data-testid="data-table-product-number"]').text();
                var quantity = 'qty' + (i+1);
                url += 'part' + (i+1) + '=' + encodeURIComponent(partNumber) + '&' + quantity + '=1&';
            });
            url = url.slice(0, -1); // remove the last '&'
            $('#add-to-cart-btn').attr('href', url);
            console.log(url);
        }
    });
}

function addHighlighting(){
    _log('adding highlighting');
    GM_addStyle(`mark { background: #BFEA8BCC !important;  color:#000c !important;}`);
    var changeflag = 0;

    doMark();
    // setInterval(addHighlighting, 1500);
    // $('.header__searchinput').keyup(function(){
    //     //debouncery();
    //     _.debounce(doMark, 500);
    //     // _log('keypress');
    //     // _.debounce((changflag)=> {_log('debouncerun'); doMark();}, 200)
    //     // _log('kepress done');
    // });

    // var db = _.debnounce(doMark, 500);
    $('.header__searchinput').on('keyup', _.debounce(doMark,500,false));

    window.addEventListener('scroll', _.throttle(doMark, 1000));

//     window.addEventListener('popstate', function (event) {
// 	    setTimeout(doMark, 3500);
//     });

    let previousUrl = '';
    const observer = new MutationObserver(function(mutations) {
        if (location.href !== previousUrl) {
            previousUrl = location.href;
            console.log(`URL changed to ${location.href}`);
            doMark();
            setTimeout(doMark, 3500);
        }
    });
    const config = {subtree: true, childList: true};
    observer.observe(document, config)

    // $('body').unmark()
_log('end add highlighting');
}



function doMark(){
        // _log('a;slkdjfal;sjdf;lajsdf;lkjas;dlkj');
        $('body').unmark()
        var searchterm = $('.header__searchinput').val();
        console.log(searchterm + ' changed');
        $('body').mark(searchterm);
}

function doMark2(){
        // _log('a;slkdjfal;sjdf;lajsdf;lkjas;dlkj');
        $('body').unmark()
        var searchterm = $('.header__searchinput').val();
        console.log(searchterm + ' changed ');
        $('body').mark(searchterm);
}

function moveSearchWithin(){
    $('[ref_page_event="Search Within Results"]').insertAfter($('[data-testid="apply-all-button"]').parent());
}

function moveFilterToggle(){
 $('[data-testid="switch-filter-options"]').parent().insertBefore($('[data-testid="share-popup-trigger"]'));
}

function addCategoryCount($item){
    console.log('adding category count', $item );
    console.log(arguments.callee.name);
    // l();
    GM_addStyle(`
    .catsum { padding: 0px 20px; color:rgb(189, 181, 170); font-size:14px !important;}
    `);
    // $('[data-testid="subcategories-container"]').each(function(){
    var catsum = getCategoryFamilySum($item);
    console.log('category count', catsum );
        // console.log(getCategoryFamilySum($(this)), $(this).prev().prev().text());

        $item.prev().prev().append('<span class="catsum">'+ catsum+ ' items</span>');

}

function hidePackageCol(){
    $('[data-testid="sort--5-asc"]').closest('th').hide();
    GM_addStyle(`th[data-id="-5"], td[data-atag="tr-packaging"] { display:none}`);
}
function getCategoryFamilySum($category){
    var sum = 0;
    $category.find('a>span>span').each(function(){
        sum = sum + parseInt($(this).text());
    });
    return sum;
}

function addTopResultsPreview(){
    // $('[data-testid="result-top"]')
   $('body').on('mouseenter', '[data-testid="result-top"] img:not(.tooltipstered)', doImageTooltip)
}


function redrawCategoryPage(){
    GM_addStyle(`
    [data-testid="image-view"] img {
                                     height: 175px !important;
                                     width:175px !important;

                                   }
    [data-testid="image-view"]>a>div {
                                     background-size: 100%;
                                     background-repeat: no-repeat;
                                   }
    [data-testid="image-view"]>a>div, [data-testid="image-view"]>a>div>div     {
        height:100%;
    }
 /* The semi-transparent background behind family name text */
     [data-testid="image-view"]>a>div>div>div:nth-child(2) { background-color: rgb(1,1,1, .8);}

 /* change item count font size*/
      [data-testid="image-view"] p:nth-child(2) { font-size: 12px;}
      [data-testid="image-view"] p:nth-child(1) { font-size: 14px;}

     main>section>div>h1 {display:none;}
    `);
    $('[data-testid="image-view"]').each(function(){
        var img = $(this).find('img:first');
        var imgsrc = img.attr('src');
        // console.log(imgsrc);
        // $(this).find('a>div:first').css({'background-image':'url('+imgsrc+')'});
        console.log($(this).find('a').attr('href'));
    });
    $('[ref_page_event="Select Family"]').prev().css('margin-top','0px');
    $('[ref_page_event="Select Family"]').parent().parent().css('padding','0px')

    //hide category title
    $('[ref_page_event="Select Family"]').prev().hide();
    largerBreadcrumbs();
    moveResultsCountToBreadcrumbs();
}

function largerBreadcrumbs(){
    GM_addStyle(`
      .MuiBreadcrumbs-ol a, .MuiBreadcrumbs-ol p { font-size: 16px !important;}
    `);
}

function moveResultsCountToBreadcrumbs(){
 var separator = $('.MuiBreadcrumbs-separator:first').clone();
 $('.MuiBreadcrumbs-ol').append(separator).append($('[data-testid="static-product-count"]').parent().css('font-size','16px'));
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
            'updateAnimation': false,
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

//-----------------
function addFamilyHoverTooltip(){
   console.log(arguments.callee.name);
   $('body').on('mouseenter', 'ul[data-testid="n-lvl-ul-0"] a:not(.tooltipstered)', doFamilyTooltip)
   console.log(arguments.callee.name, ' added');
}

function doFamilyTooltip(){
    console.log('dofamilytooltip', this);
    GM_addStyle(`.tooltipster-content img[data-testid="data-table-0-product-image"] {height:75px !important; width: 75px !important;)}`)
     $(this).tooltipster({
            content: '<img width=64px src="https://github.com/bombledmonk/keymaster/blob/master/loading_resistor.gif?raw=true"></br> ...loading...',
            'contentAsHTML': true,
            'side': 'right',
            'distance': 0,
            'multiple': true,
            'delay': 500,
            'contentCloning': true,
            'updateAnimation': false,
            'interactive': true,
            'functionInit': function (instance, helper) {
                // instance.content('<iframe src="'+helper.origin.href+'">')
                 var famname = helper;
                console.log('helper',helper.origin.innerText);

                 $.get( helper.origin.href)
                        .done(function(x){
                            console.log($(x), ' loaded')
                            var exampleImages =
                                    $(x)
                                    .find('img[data-testid="data-table-product-image"]')
                                    .not('[src*=NoPhoto]')
                                    .attr('height', '75px')
                                    .attr('width', '75px');

                            instance.content(deDuplicateCollection( exampleImages,    'src'));
                            console.log('html '+$(x).html());
                            sessionStorage.setItem(helper.origin.href, true);
                        }
                  );


//                 $.get( helper.origin.href)
//                         .done(function(x){
//                             console.log($(x), ' loaded')
//                             var exampleImages =
//                                     $(x)
//                                     .find('img[data-testid="data-table-0-product-image"]')
//                                     .not('[src*=NoPhoto]')
//                                     .attr('height', '75px')
//                                     .attr('width', '75px');

//                             instance.content(deDuplicateCollection( exampleImages,    'src'));
//                             console.log('html '+$(x).html());
//                             sessionStorage.setItem(helper.origin.href, true);
//                         }
//                   );
            },
            'functionReady': function (instance, helper) {
                console.log('tooltipster functionready');

                // instance.content('hello world');
                // console.log('tooltipfunctionready', helper.origin.href);
                if(sessionStorage.getItem(helper.origin.href) == null){


                }
                // instance.reposition();
            },
        })
          .tooltipster('open');

}

function deDuplicateCollection($collection, attribute) {
    //deduplicates a collection of  jquery objects based on an attribute name as a string
    _log('deDuplicateCollection() Start', DLOG);
    var found = {};
    return $collection.filter(function () {
        var $this = $(this);
        if (found[$this.attr(attribute)]) {
            return false;
        }
        else {
            found[$this.attr(attribute)] = true;
            return true;
        }
    });
    _log('deDuplicateCollection() End', DLOG);
    return $collection;

}

//----------------------
function addPDPRowHoverHighlight(){
   GM_addStyle(`
       [data-testid="product-attributes"] tr:hover {
                                                    background-color:rgb(60, 42, 42);
                                                    }
   `);
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
DarkReader.setFetchMethod(window.fetch);
    DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10
    });
DarkReader.exclude('css', '#datasheet-maincontainer');
// Get the generated CSS of Dark Reader returned as a string.

    DarkReader.addDynamicSiteRule('exclude', '#datasheet-maincontainer');
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
    //TODO I don't think this is needed anymore with OneUI
    console.log('runing supplier match');
    $('tr[data-testid="data-table-0-row"]').each(function(i,x){
        // console.log('row');
        try{

            var supplier = $(x).find('td[data-atag="tr-supplier"] a');
            var manufacturer = $(x).find('td[data-atag="tr-manufacturer"]');
            var qty = $(x).find('td[data-atag="tr-qtyAvailable"]');
            // console.log(supplier);
            if (supplier.text().trim() !== manufacturer.text().trim()){
                // console.log(supplier.text());
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
    waitForKeyElements('[data-testid="price-and-procure-title"]',doAfterPricingLoad, true);
    addPDPImageZoom();
    addPDPRowHoverHighlight();
    //rightAlignCols();
    // waitForKeyElements('[data-testid="price-and-procure-title"]',zeroStockOtherSuppliers);
}

function doAfterPricingLoad(){
    addNonStock();
    zeroStockOtherSuppliers();
    loadHTMLDatasheets();
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
        $('[data-testid="price-and-procure-title"] span').text("Non-Stock - Availble to Order")
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
    $('.moredocs').text('(see '+($('[data-testid="docs-media-table"] table tbody a').length-1) +' more docs)')
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




function loadHTMLDatasheets(){
    try{
        // Your code here...
        var htmldatasheet = document.querySelectorAll('a[href*="htmldatasheets"')[0].href;
        console.log('html datasheet link', htmldatasheet);

        $('main').append('<div id="htmlds">hello world</div>');
        $('#htmlds').load(htmldatasheet, function(){
            $(this).find('#header,#footer').hide();
        });
        GM_addStyle(`
        .fc0 {color: rgba(13, 8, 0, 0.95) !important;}
        `);
        DarkReader.exclude('css', '#datasheet-maincontainer');
// Get the generated CSS of Dark Reader returned as a string.

    DarkReader.addDynamicSiteRule('exclude', '#datasheet-maincontainer');
    }catch(e){
        console.log('error loading html datasheet');
    }
}


function addPLPPricingHover(){
  //data-testid="pricing-group"
     $('body').on('mouseenter', '[data-atag="tr-unitPrice"]:not(.tooltipstered)', doPriceTooltip)

}


function doPriceTooltip(){

    //TODO check out why pricing isn't coming back or if pricing might be hidden on the page in fallback form
    console.log('doPriceTooltip', this);
    // GM_addStyle(`.tooltipster-content img[data-testid="data-table-0-product-image"] {height:75px !important; width: 75px !important;)}`)
     $(this).tooltipster({
            content: '<img width=64px src="https://github.com/bombledmonk/keymaster/blob/master/loading_resistor.gif?raw=true"></br> ...loading...',
            'contentAsHTML': true,
            'side': 'right',
            'distance': 0,
            'multiple': true,
            'delay': 500,
            'contentCloning': true,
            'updateAnimation': false,
            'interactive': true,
            'functionInit': function (instance, helper) {
                // console.log('init price tooltip', $(helper.origin).closest('tr').find('a[data-testid="data-table-0-product-number"]').attr('href');
                var pdplink= $(helper.origin).closest('tr').find('a[data-testid="data-table-0-product-number"]:first').attr('href');
                console.log(pdplink);
                 $.get( pdplink, function(x){
                                             console.log('whats this', $(x));
                                             var pdptext = JSON.parse($(x)[61].innerHTML);
                                             var pdpdata  = pdptext.props.pageProps.envelope.data;
                                             var productId = pdpdata.productOverview.rolledUpProductId;
                                              console.log('thisprice', $(x)[61].innerHTML, $(x).find('[id*=NEXT]'));
                                              console.log('pdptext ', pdptext.props.pageProps.envelope.data);
                                             var quantityTable = pdptext.props.pageProps.envelope.data.quantityTable;
                                             // var pricehtml = instance.content('<table id="'+productId+'" >');
                                             var tablehtml = '<table>' + '<tr><th>Break</th><th>price</th></tr>'
                                             $('#'+productId).append('<tr><th>Break</th><th>price</th>')
                                             quantityTable.reverse().forEach(function(item){
                                                 if(item.packTypeCode != 243){
                                                     tablehtml = tablehtml+ ('<tr><td>'+item.breakQty+'</td><td>'+item.unitPrice+'</td></tr>')
                                                 }
                                             });
                                             tablehtml = tablehtml + '</table>';
                                             instance.content(tablehtml);
                                           });
            },
        })
          .tooltipster('open');

}


function runIndexResults(){
    //fix index sidebar
        GM_addStyle(`
          [data-testid="category-li"]>a {
            font-size:13px;
            width:100%;
            height:95%;
          }
          [data-testid="category-li"]:hover{background-color: #15539c ;}
         [data-testid="category-li"] {line-height: 22px ;}
         [data-testid="categories-title"]+hr+div      {max-height: 100%;}
         [data-testid="categories-title"] {padding: 0px 0px 7px 0px;}
        `);
   // fix results sidebar
        GM_addStyle(`
          [data-testid^="parent-category-sidecar-"]>span {font-size:13px;}
          [data-testid^="parent-category-sidecar-"] {
                                         margin: 0px 0px;
                                         padding: 3px 0px;
                                        }

         [data-testid="categories-title"]+hr+div      {max-height: 100%;}
         [data-testid="categories-title"] {padding: 0px 0px 7px 0px;}

        `);
    // fix famiiles
        GM_addStyle(`
          [class*="NthLevelCategory-categoryListItem"]>a {
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
          [class*="NthLevelCategory-categoryListItem"]>a>span{
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

    // one column in results instead of two
         GM_addStyle(`
            [data-testid*="n-lvl-ul"] {column-count:1}
            [data-testid*="NthLevelCategory-categoryListItem"] span { line-height: 20px;}
            [data-testid="result-page"] hr, [data-testid="index-page"] hr { margin-top:-6px !important; margin-bottom:4px !important; display:none;}
            [data-testid="result-page"] a {margin: 0px;}
            [data-testid="subcategories-container"] {margin: 0px 0px 18px !important;}
         `)
          GM_addStyle(`
             .MuiContainer-maxWidthLg {max-width:1500px;}
          `);
   moveResultsCount();
   // addCategoryCount();
   waitForKeyElements('[data-testid="subcategories-container"]', addCategoryCount, false);
   waitForKeyElements('[data-testid="result-top"]', addTopResultsPreview, true);
   addFamilyHoverTooltip();
}

function moveResultsCount(){
   var results = $('[data-testid="search-results-component"]');
    $('[data-testid="result-top"] section').prepend(results);
    //replace text showing, the first double quote, and the last double quote as to preserve any " in the search term
    results.find('p').text(results.find('p').text().replace('Showing ', '').replace(/\"/,'').replace(/\"$/g,''));
    console.log('found count '+ results.text());
    GM_addStyle(`
       [data-testid="search-results-component"] p {font-size:16px;}
    `);
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
