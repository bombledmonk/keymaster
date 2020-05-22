// ==UserScript==
// @name         keymaster
// @namespace    hest.pro
// @version      0.1
// @description  A userscript for the new Digi-Key website
// @author       You
// @match        https://www.digikey.ca/en/products*
// @grant        GM_addStyle
// ==/UserScript==


//put in hover over multiselect boxes to highlihgt lines
// trim down Compare width
// add to cart compare
// css animate transitions between compact modes
// compress part status column



(function() {
    'use strict';
GM_addStyle(`
#header { height:140px;}




/* entire filter area */
.jss156 {padding-top: 0px;}

/*gap at bottom of filter table*/
.jss199 {
/*display:none;*/
}

/*multi select item line*/
.jss269 label:hover {
background-color: #cccccc;
color:white;
z-height: -1;
}

/* checkbox lines selected color invalid syntax!! doesn't work*/
label:has(span[Mui-checked]) {
background-color: #eeeeee;
}


/*checkboxes */
span[data-testid^="filter--"] {
padding: 2px 4px;
}




/*part status column wrap*/
th[data-id="1989"] { white-space: normal !important;}
th[data-id="1989"] .jss341{ line-height: 16px;}

/*qty column wrap*/
th[data-id="-103"] { white-space: normal !important;}
th[data-id="-103"] .jss341 { line-height: 16px;}

/* PLP table header */
/*.MuiTableCell-head { background-color: #cc0000;}*//* sets table header to red*/

/* PLP table header button */
.jss341 {
    /* background-color: #cc0000;*/ /*sets table header button to red*/
    padding: 0px 2px;
}








/* breadcrumb font size  TODO*/
.jss115 { font-size: 14pt;}






`);


// !!!!!!!!!!!!track down filter and back button bug where filters were selected, applied, then back button pressed and filters don't come back.  video record


moveMfrCol();
//hideDKPN();
//hidePackage();
wrapAllHeaders();
hideSortArrows();
dontWrapCatDescr();
hideCategoryBox();
tableCellPadding();
tableHeaderTextSize();
stopUpperCaseFilters();
removeNavBar();
tableImageBlend();
hideCompareText();

//moveBreadcrumbs();


// adder = 10;
// document.querySelectorAll('.jss250').forEach(function(m){
//     x=0;
// console.log('m', m);
//     m.querySelectorAll('label').forEach(function(z){

//        console.log('zstyletop', parseInt(z.style.top)-x + "px");
//         z.style.top = parseInt(z.style.top)-x + "px";
//         z.style.height = "15px";
// x= x+adder;
// console.log('x', x);
//     });

// });


    // Your code here...
})();

function template(){
GM_addStyle(`

`);
}

function template(){
GM_addStyle(`

`);

    document.querySelectorAll('');
}

function hideCompareText(){
GM_addStyle(`
/*compare text hide*/
th[data-id="-99"] span{display:none;}
`);
}

function tableImageBlend(){
GM_addStyle(`
/*table image background mixing.*/
img[data-standard-url] {
    mix-blend-mode: multiply;
}

`);
}

function removeNavBar(){
GM_addStyle(`
.flymenu__nav-bar{display:none;}

`);
}

function stopUpperCaseFilters(){
GM_addStyle(`
.MuiGrid-container.MuiGrid-spacing-xs-2.MuiGrid-wrap-xs-nowrap>div>div>div{
text-transform:none;
padding: 6px 8px;
}
`);
}

function tableHeaderTextSize(){
GM_addStyle(`
/* PLP header text */
#data-table-0 th { font-size: 12px;}

/* PLP table header button */
[ref_page_event="Sort Table"] {
    /* background-color: #cc0000;*/ /*sets table header button to red*/
    padding: 0px 2px;
}
`);
}

function tableCellPadding(){
GM_addStyle(`
/*table cell padding*/
#data-table-0 td { padding:4px 6px;}


`);
}

function hideCategoryBox(){
GM_addStyle(`
/* PLP silly category box */
.jss205  {display:none;}
`);
}



function dontWrapCatDescr(){
GM_addStyle(`
/*short descr text*/
[data-atag="tr-product"] div>div {
white-space:nowrap;
}
`);
}



function moveMfrCol(){
//mfr table column header  data-id="-1"
    GM_addStyle(`
/*get rid of mfr link styling*/
td[data-atag="tr-product"] a {text-decoration:none;}
.tr-manufacturer{display:none;}
th[data-id="-1"] { display:none;}
`);
  document.querySelectorAll('[data-atag="tr-manufacturer"]').forEach(function(x){
    //x.style.display = 'none';
      console.log(x);
      x.closest('tr').querySelector('[data-atag="tr-product"] div>div:last-of-type').appendChild(x.querySelector('a'))
      x.style.display = 'none';


  });
}

function hideDKPN(){
GM_addStyle(`
td[data-atag="tr-dkProducts"]{ display:none;}
th[data-id="-104"] { display:none;}

`);
}

function hidePackage(){
GM_addStyle(`
td[data-atag="tr-packaging"]{ display:none;}
th[data-id="-5"] { display:none;}
`);
}
function wrapAllHeaders(){
    GM_addStyle(`
div[data-testid="sb-container"] th{
white-space: normal !important;
}

div[data-testid="sb-container"] th .MuiGrid-item{
line-height: 16px !important;
}

th[data-testid="result-header-cell"]>div>div{
height:auto;
}

`);
}

function moveBreadcrumbs(){
var breadcrumbs = document.querySelector('.jss115'); //.jss115 is breadcrumbs div
document.querySelector('.jss208').closest('div').prepend(breadcrumbs);

}

function hideSortArrows(){
GM_addStyle(`
/* PLP sort arrow padding*/
div[ref_page_event="Sort Table"]{
 display:flex;
}
div[ref_page_event="Sort Table"]>div{
padding-left:2px;
}




/*table header sort button*/
[data-testid="result-header-cell"]>div>div>div {
/*visibility:hidden;*/
display:none;
}
[data-testid="result-header-cell"]:hover div>div>div{
   visibility: visible;
display: inline-flex;
}
`);
}

//    document.querySelector('div[data-testid="sb-container"] th.')


