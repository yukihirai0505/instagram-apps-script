var bk = SpreadsheetApp.getActiveSpreadsheet();
var rankingSheet = bk.getSheetByName("ranking");

var targetUrl = rankingSheet.getRange(5, 3).getValue();

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "Set Category && Ranking URL", functionName: "setBaseData"},
    {name: "Set Point", functionName: "setPoint"},
    {name: "Set ReviewCount", functionName: "setReviewCount"},
  ];
  bk.addMenu("Custom Menu", menu);
}

function setBaseData() {
  var response = UrlFetchApp.fetch(targetUrl).getContentText('Shift_JIS');
  setTargetCategory(response);
  setRanking(response);

  function setTargetCategory(response) {

    var categoryName = getCategoryName(response);
    rankingSheet.getRange(5, 4).setValue(categoryName);

    function getCategoryName(response) {
      var regex = /<div class="inner-sp-ttl">[\s\S]*?<h2><a href=".*>(.*)<\/a><\/h2>/;
      return regex.exec(response)[1];
    }

  }

  function setRanking(response) {

    var rankingData = getRanking(response);
    for (var i = 0; i < 10; i++) {
      var ranking = rankingData[i];
      var itemLink = getItemLink(ranking);
      var brandName = getBrandName(ranking);
      var itemName = getItemName(ranking);
      rankingSheet.getRange(10+i, 3, 1, 3).setValues([[itemLink, brandName, itemName]]);
    }

    function getRanking(response) {
      var regex = /<dd class="summary">([\s\S]*?)<\/dd>/g;
      return response.match(regex);
    }

    function getItemLink(response) {
      var regex = /<p class="votes"><a href="(.*reviews)"/;
      return regex.exec(response)[1];
    }

    function getBrandName(response) {
      var regex = /<span class="brand"><a href=.*?>(.*?)<\/a>/;
      return regex.exec(response)[1];
    }

    function getItemName(response) {
      var regex = /<span class="item"><a href=.*>(.*)<\/a>/;
      return regex.exec(response)[1];
    }

  }
}

function setPoint() {

  var rankLinks = rankingSheet.getRange(10, 3, 10, 1).getValues();
  for (var i = 0; i < rankLinks.length; i++) {
    var rankLink = rankLinks[i][0];
    var response = UrlFetchApp.fetch(rankLink).getContentText('Shift_JIS');
    var ratingValue = getRatingValue(response);
    var point = getPoint(response);
    rankingSheet.getRange(10+i, 6, 1, 2).setValues([[ratingValue, point]]);
  }

  function getRatingValue(response) {
    var regex = /<p.*itemprop="ratingValue">(.*)<\/p>/;
    return regex.exec(response)[1];
  }

  function getPoint(response) {
    var regex = /<span class="point">(.*)pt<\/span>/;
    return regex.exec(response)[1];
  }

}

var msfPath = '/msf/1';
var rdPath = '/rd/';
var rd3Path = '/rd/3';
var rd2Path = '/rd/2';
var rd1Path = '/rd/1';

function setReviewCount() {

  var rankLinks = rankingSheet.getRange(10, 3, 10, 1).getValues();
  for (var i = 0; i < rankLinks.length; i++) {
    var rankLink = rankLinks[i][0];
    setReviewCount(rankLink, i);
  }

  function setReviewCount(rankLink, index) {
    var links = [
      rankLink + rd3Path,
      rankLink + rd3Path + msfPath,
      rankLink + rd2Path,
      rankLink + rd2Path + msfPath,
      rankLink + rd1Path,
      rankLink + rd1Path + msfPath
    ];
    var reviewCounts = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      try {
        var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
        reviewCounts[i] = getReviewCount(response);
      } catch(err) {
        reviewCounts[i] = 'couldn\'t get'
      }
    }
    rankingSheet.getRange(10+index, 8, 1, 6).setValues([reviewCounts]);
  }

  function getReviewCount(response) {
    var regex = /<span class="count cnt" itemprop="reviewCount">(.*)<\/span>/;
    return regex.exec(response)[1];
  }

}