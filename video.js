const apiKey=localStorage.getItem("api_key");
console.log(apiKey);
let cookieString=document.cookie;
// let videoId=cookieString.split('=')[1];
// console.log(videoId)
// console.log(cookieString);
let cookieValue="";
if(cookieString && cookieString!==""){
   let cookieName="myCookie=";
   let cookieArray=cookieString.split(';');

   for(let i=0;i<cookieArray.length;i++ ){
    let cookieItem=cookieArray[i].trim();

    if(cookieItem.indexOf(cookieName)===0){
      cookieValue=cookieItem.substring(cookieName.length);
      break;
    }
   }
}
let videoId,inputValue;

if(cookieValue!==""){
  let myObject=JSON.parse(cookieValue);
  console.log(myObject);
  videoId=myObject.videoId;
  inputValue=myObject.inputValue;
}


//for header -----------
window.addEventListener('DOMContentLoaded',async function(){

    const headerContainer=document.getElementsByClassName('headerContainer')[0];

    try{
     const response=await fetch('header.html');
     const data=await response.text();
     headerContainer.innerHTML=data;
     let searchInput=document.getElementById('input-search');
     let searchBtn=document.getElementById('search-btn');
      
     searchBtn.onclick=function(){
        searchVideos(searchInput);
     }

    }
    catch(error){
        console.log("error fetching header.html ",error);
    }
})

// for searching and navigate to new page----
function searchVideos(searchInput){
    const path='/search.html';  
    const query=searchInput.value.trim();
    if(query){
        document.cookie=`query=${query};path=${path}`;
   window.open('http://127.0.0.1:5500/search.html','blank');
    }
    else{
        return false;
    }

}



let iframeScript=document.getElementsByTagName('script')[0];
iframeScript.addEventListener('load',onScriptLoaded);

function onScriptLoaded(){
if(YT){
    new YT.Player('video-player',{
        height:'400',
        width:'600',
        videoId,
         events:{
            onReady:(event)=>{
                // console.log(event)
                document.title=event.target.videoTitle;
                console.log("videos loaded");
                fetchStats(videoId);
                fetchVideoDetails(videoId); 
                fetchSuggestionVideos();
            }
         }
    })
}
}




async function fetchVideoDetails(videoId){


    const endpoint=`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`;

   try{
    const response=await fetch(endpoint);
    const data= await response.json();
    console.log(data);
    if(data.items.length>0){
    renderComments(data.items);
    }
   }
   catch(error){
    console.log(error);
   }

}




let videoDetalis=document.getElementsByClassName('video-details')[0];



async function fetchChannelStats(channelId){
    const endpoint=`https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    
    try{
        const response=await fetch(endpoint);
        const result=await response.json();
        // console.log(result.items[0]);
        return result.items[0];
    }
    catch(error){
      console.log(error);
    }
    
    }
    
function format(count){
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

async function fetchStats(videoId){

    const endpoint=`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${apiKey}&id=${videoId}`;

     try{
        const response=await fetch(endpoint);
        const result=await response.json();
        // console.log(result);
        const item=result.items[0];

         
        const channelStats=await fetchChannelStats(item.snippet.channelId);
        // console.log(channelStats)
        const channelLogo=channelStats.snippet.thumbnails.default.url;
        const subscribers=format(channelStats.statistics.subscriberCount);

        videoDetalis.innerHTML=`
        <h4 id="title">${item.snippet.title}</h4>
        <div class="channel-section">
          <div class="channel">
            <div class="channel-logo">
              <img src=${channelLogo} alt="logo" />
            </div>
            <div class="title-subscriber">
              <p id="channel-name">${item.snippet.channelTitle}</p>
              <p id="subscriber"> ${subscribers} subscribers</p>
            </div>
            <div class="subscribe-btn">
              <button>Subscribe</button>
            </div>
          </div>
          <div class="like-share-info">
            <div class="like-dislike">
              <i class="far fa-thumbs-up" id="like">${format(item.statistics.likeCount)}</i> |
              <i class="far fa-thumbs-up fa-rotate-180" id="dislike"></i>
            </div>
            <div class="share">
              <i class="fas fa-share"></i>
              <span>Share</span>
            </div>
            <div class="other">
              <p>...</p>
            </div>
          </div>
        </div>
        `
     }
     catch(error){
        console.log(error);
     }
}



function renderComments(commentList){
    
let commentsHeading=document.getElementById('comments');
commentsHeading.innerHTML=`${commentList.length>0? `Top ${commentList.length} Comments`:`NA`}`;

let commentsBody=document.getElementsByClassName('comments-body')[0];

for(let i=0;i<commentList.length;i++){

const topComment=commentList[i].snippet.topLevelComment;
commentsBody.innerHTML +=`


<div class="user-comment">
<div class="user-logo">
  <img src=${topComment.snippet.authorProfileImageUrl} alt="user">
</div>
<div class="user-comment-info">
 <div class="user-name-time">
  <span class="user-name">${topComment.snippet.authorDisplayName}</span>
   <span class="comment-time">${formatDate(topComment.snippet.publishedAt)}</span>
 </div>
  <p class="comment-description">${topComment.snippet.textOriginal}</p>
  <div class="comment-like-dislike-reply">
    <i class="far fa-thumbs-up" id="like">${format(topComment.snippet.likeCount)}</i>
    <i class="far fa-thumbs-up fa-rotate-180" id="dislike"></i>
    <span class="reply">Reply</span>
  </div>
</div>
</div>

`
}

}

// for suggestion videos--



async function fetchSuggestionVideos(){

  let endpoint=`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${inputValue}&maxResults=20&key=${apiKey}`;


  try{
   let response=await fetch(endpoint);
   let result= await response.json();
  //  console.log(result);
   showSuggestionVideos(result.items);
  }
  catch(error){
    console.log("fetching suggestions videos is failed",error);
  }
}




 function showSuggestionVideos(items){

  let suggestioncontainer=document.getElementsByClassName('suggestion-container')[0];

  for(let videoItem of items){
    let imageUrl=videoItem.snippet.thumbnails.high.url;
    let suggestionVideo=document.createElement('div');
    suggestionVideo.className='suggestion-video';


    suggestionVideo.innerHTML=`
    
    <div class="suggestion-video-image">
    <img src=${imageUrl} alt="suggestion-video">
  </div>
  <div class="suggestion-video-info">
    <h4 class="suggestion-video-title">${videoItem.snippet.title.slice(0,30)}...</h4>
     <p class="suggestion-video-channel">${videoItem.snippet.channelTitle}</p>
     <p class="suggestion-video-uploadtime">${formatDate(videoItem.snippet.publishedAt)}</p>
  </div>
    
    `
  suggestioncontainer.append(suggestionVideo);
  }

}



// https://youtube.googleapis.com/youtube/v3/channels?





// function updateVideoPlayerSize(){
//    let videoPlayer=document.getElementById('video-player');

// if(window.matchMedia('(max-width:850px)').matches){
//     videoPlayer.style.width='450px';
//     videoPlayer.style.height='350px';
// }
// else{
//     videoPlayer.style.width='600px';
//     videoPlayer.style.height='400px';
// }
// }

// window.addEventListener('load',updateVideoPlayerSize);
// window.addEventListener('resize',updateVideoPlayerSize);
