// ==UserScript==
// @name         Digi-Keymaster
// @namespace    hest.pro
// @version      0.1
// @description  A userscript for Digi-Key's updated search
// @author       Ben Hest  
// @match        https://www.digikey.*/en/products/*
// @icon         https://www.google.com/s2/favicons?domain=digikey.com
// @require      https://code.jquery.com/jquery-3.6.0.js
// @grant        GM_addStyle
// ==/UserScript==


// Are you the Keymaster?
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

})();
function a(selector){
    return document.querySelectorAll(selector);
}


// [data-testid="data-table-0"
