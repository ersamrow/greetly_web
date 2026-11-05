import type {Template} from './templates';
type Starter={heading:string;message:string};
type Language='hi'|'pa';
const messages:Record<string,Record<Language,Starter>>={
 Birthday:{hi:{heading:'जन्मदिन मुबारक हो!',message:'आपका यह दिन अपनों के प्यार और हँसी से भरा हो। आने वाला साल आपके लिए खुशियाँ और नए अवसर लेकर आए।'},pa:{heading:'ਜਨਮਦਿਨ ਮੁਬਾਰਕ!',message:'ਤੁਹਾਡਾ ਅੱਜ ਦਾ ਦਿਨ ਆਪਣਿਆਂ ਦੇ ਪਿਆਰ ਅਤੇ ਹਾਸਿਆਂ ਨਾਲ ਭਰਿਆ ਹੋਵੇ। ਆਉਣ ਵਾਲਾ ਸਾਲ ਤੁਹਾਡੇ ਲਈ ਖੁਸ਼ੀਆਂ ਅਤੇ ਨਵੇਂ ਮੌਕੇ ਲੈ ਕੇ ਆਵੇ।'}},
 'Thank you':{hi:{heading:'दिल से धन्यवाद',message:'समय निकालकर मेरा साथ देने के लिए धन्यवाद। आपकी मदद ने मुश्किल समय को आसान बना दिया।'},pa:{heading:'ਦਿਲੋਂ ਧੰਨਵਾਦ',message:'ਸਮਾਂ ਕੱਢ ਕੇ ਮੇਰਾ ਸਾਥ ਦੇਣ ਲਈ ਧੰਨਵਾਦ। ਤੁਹਾਡੀ ਮਦਦ ਨੇ ਔਖਾ ਸਮਾਂ ਸੌਖਾ ਬਣਾ ਦਿੱਤਾ।'}},
 Diwali:{hi:{heading:'शुभ दीपावली!',message:'दीयों की रोशनी आपके घर में खुशियाँ और मन में नई उम्मीद लाए। आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएँ।'},pa:{heading:'ਦੀਵਾਲੀ ਦੀਆਂ ਮੁਬਾਰਕਾਂ!',message:'ਦੀਵਿਆਂ ਦੀ ਰੌਸ਼ਨੀ ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਖੁਸ਼ੀਆਂ ਅਤੇ ਮਨ ਵਿੱਚ ਨਵੀਂ ਉਮੀਦ ਲਿਆਵੇ। ਤੁਹਾਨੂੰ ਅਤੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਦੀਵਾਲੀ ਦੀਆਂ ਦਿਲੋਂ ਮੁਬਾਰਕਾਂ।'}},
 Anniversary:{hi:{heading:'सालगिरह मुबारक!',message:'आपका साथ प्यार, भरोसे और हँसी से भरा रहे। आने वाले वर्षों में साथ मिलकर और भी खूबसूरत यादें बनाएँ।'},pa:{heading:'ਵਰ੍ਹੇਗੰਢ ਮੁਬਾਰਕ!',message:'ਤੁਹਾਡਾ ਸਾਥ ਪਿਆਰ, ਭਰੋਸੇ ਅਤੇ ਹਾਸਿਆਂ ਨਾਲ ਭਰਿਆ ਰਹੇ। ਆਉਣ ਵਾਲੇ ਸਾਲਾਂ ਵਿੱਚ ਇਕੱਠੇ ਹੋਰ ਵੀ ਸੋਹਣੀਆਂ ਯਾਦਾਂ ਬਣਾਓ।'}},
};
export function messageStarter(t:Template,language:Language):Starter|undefined {
 return messages[t.festival||t.category]?.[language];
}
