const apiKey='AIzaSyDHMQ0rn-rtl1YmBgnIfdLWOhTac0SL-0o';
localStorage.setItem("api_key",apiKey);
let searchInput;
//for header -----------
window.addEventListener('DOMContentLoaded',async function(){

  const headerContainer=document.getElementsByClassName('headerContainer')[0];

  try{
   const response=await fetch('header.html');
   const data=await response.text();
   headerContainer.innerHTML=data;


    searchInput=document.getElementById('input-search');
   let searchBtn=document.getElementById('search-btn');
   searchBtn.addEventListener('click',()=>{
    searchVideos(searchInput);
   });
  // searchBtn.onclick=function(){
  //   searchVideos(searchInput)
  // };
  }
  catch(error){
      console.log("error fetching header.html ",error);
  }
})


window.addEventListener('load',()=>{
    // searchInput.value="";
  fetchVideos();
});





function searchVideos(searchInput){
     let searchValue=searchInput.value;
     fetchVideos(searchValue);
}

async function fetchVideos(searchValue){
    let endpoint=`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchValue}&maxResults=20&key=${apiKey}`;
   
    try{
    let response=await fetch(endpoint);
    let data=await response.json();

     for(let item of data.items){
       let videoId=item.id.videoId;
      let videoStats=await fetchStats(videoId);
      // console.log(videoStats.items.statistics) 
      // console.log(videoStats);
      if(videoStats.items.length>0)    
       item.videoStats=videoStats.items[0].statistics; 
       item.duration=videoStats.items[0] && videoStats.items[0].contentDetails.duration;
     }


    showVideos(data.items);
    }
    catch(error){
        console.log('something went wrong',error);
    }
}

// -----------for formating views------------------
function formatViews(count){
if(count<1000){
  return count;
}
else if(count<=999999 && count>=1000){
const thousand=parseInt(count/1000);
return thousand+"k";
}
else if(count>=1000000){
  const millions=parseInt(count/10000);
  return millions+"m";
}
}

// --------for formating Date-----------------------

function formatDate(inputDateTime){
  let date=new Date().getTime();
  console.log(date);
  let target=new Date(inputDateTime).getTime();
  console.log(target);
  let timeDiff=Math.abs(date-target);
  // console.log(timeDiff)
  let daysDiff=Math.ceil(timeDiff/(1000*3600*24));
  // console.log(daysDiff);
  
  if(daysDiff===0){
      const today= new Date(Date.now()-target).getHours();
      return today+'ago';
  }
  else if(daysDiff===1){
      return 'yesterday';
  }
  else if(daysDiff>1 && daysDiff<=7){
      return `${daysDiff} days ago`;
  }
  else if(daysDiff>7 && daysDiff<=14){
      return `last week `;
  }
  else if(daysDiff>14 && daysDiff<=30){
      return `${Math.floor(daysDiff/7)} weeks ago`;
  }
  else if(daysDiff>30 && daysDiff<=365){
      return `${Math.floor(daysDiff/30)} months ago`
  }
  else {
      return `${Math.floor(daysDiff/365)} years ago`
  }
  
  }


// ------------formating duration-------------------


function formatDuration(duration){
if(duration || duration!==undefined){
let p=duration.indexOf('P');
let d=duration.indexOf('D');
let t=duration.indexOf('T');
let h=duration.indexOf('H');
let m=duration.indexOf('M');
let s=duration.indexOf('S');

let day=0,hour=0,min=0,sec=0;
if(p!==-1 && d!==-1 && t!==-1 && h!==-1 && m!==-1 && s!==-1){
    day=duration.substring(p+1,d);
    hour=duration.substring(t+1,h);
    min=duration.substring(h+1,m);
    sec=duration.substring(m+1,s);
    return `${day}:${hour}:${min}:${sec}`;
}
else if(p!==-1 && d===-1 && t!==-1 && h!==-1 && m!==-1 && s!==-1){
    hour=duration.substring(t+1,h);
    min=duration.substring(h+1,m);
    sec=duration.substring(m+1,s);
    return `${hour}:${min}:${sec}`;
}
else if(p!==-1 && d===-1 && t!==-1 && h===-1 && m!==-1 && s!==-1){
    min=duration.substring(t+1,m);
    sec=duration.substring(m+1,s);
    return `${min}:${sec}`;
}
else if(p!==-1 && d===-1 && t!==-1 && h===-1 && m===-1 && s!==-1){
    sec=duration.substring(t+1,s);
    return `${min}:${sec}`;
}
}
else{
  return '';
}
// console.log(day,hour,min,sec);
}


 function showVideos(items){
    console.log(items);
    let main=document.getElementsByTagName('main')[0];
    main.innerHTML="";

    for(let videoItem of items){

     let imageUrl=videoItem.snippet.thumbnails.high.url;
     let videoCard=document.createElement('div');
     videoCard.className='videoCards';
      
     videoCard.addEventListener('click',()=>{
      navigateToVideo(videoItem.id.videoId);
     });

    videoCard.innerHTML=`
    <div class="image">
        <img src= ${imageUrl} alt="">
        <span class="duration">${videoItem.duration?formatDuration(videoItem.duration):''}
        </span>
    </div>
    <div class="video-info">
      <div class="channel-logo">
        <img src="assets/images/youtube.png" alt="channel-logo">
      </div>
      <div class="info">
        <h5 id="title">${videoItem.snippet.title.slice(0,35)}...</h5>
        <p >${videoItem.snippet.channelTitle}</p>
        <div class="view-time">
            <span class="views">${videoItem.videoStats ? formatViews(videoItem.videoStats.viewCount)+' Views':'NA'}</span>
            <span class="time">${formatDate(videoItem.snippet.publishedAt)}</span>
        </div>
      </div>
    </div>

     `;

     main.append(videoCard);
    }

}

// https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=Ks-_Mh1QhMc&key=[]
async function fetchStats(videoId){

  const endpoint=`https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${apiKey}`

     let response=await fetch(endpoint);
     let result= await response.json();
      console.log(result);
  return result;
}


// ---------navigate to new page--------------------
function navigateToVideo(videoId){
  console.log(videoId);
  console.log(searchInput);
  
if(videoId){
//   const path='/video.html';
   const path='video.html';
  // document.cookie=`videoId=${videoId}; path=${path}`
   let myObject={videoId:`${videoId}`,inputValue:`${searchInput.value}`};
   let cookieValue=JSON.stringify(myObject);
   document.cookie="myCookie="+cookieValue;
//  window.open('http://127.0.0.1:5500/video.html','blank');
   window.open(path,'blank');
}
else{
  alert('Owner want to watch this video in Youtube');
}
}
