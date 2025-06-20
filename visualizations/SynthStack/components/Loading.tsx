import {Spinner} from 'nr1'
const LoadingState = ({monitorsToLoad, loadedPercent}) => {  

 if(monitorsToLoad === 0) {
    return <div>Determining monitors to load... <Spinner inline /></div>;   
 }
 return <div>
        Loading {monitorsToLoad} monitors... {loadedPercent}% complete <Spinner inline />
  </div>
};

export default LoadingState;