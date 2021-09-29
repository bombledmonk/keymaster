// ==UserScript==
// @name         Digi-Key-Master
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  try to take over the world!
// @author       You
// @match        https://www.digikey.com/en/products/*
// @icon         https://www.google.com/s2/favicons?domain=digikey.com
// @require      https://code.jquery.com/jquery-3.6.0.js
// @grant        GM_addStyle
// ==/UserScript==

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
    console.log('setting timeout');
    setTimeout ( supplierMatch, 4000);

    descriptionNoWrap();
    hideSupplierCol();
    trimTableWhiteSpace();
    hideCompareText();
    biggerThumbnail();

    console.log('ok');
})();
function a(selector){
    return document.querySelectorAll(selector);
}

function descriptionNoWrap(){
     GM_addStyle(`
         div[data-testid="data-table-0-product-description"] {white-space: nowrap;}
    `);
}


function hideSupplierCol(){
    $('button[data-testid="sort--8-asc"]').closest('th').attr('data-id','-8');
    GM_addStyle(`
         th[data-id="-8"],td[data-atag="tr-supplier"] {display:none;}
    `);
}

function trimTableWhiteSpace(){
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
