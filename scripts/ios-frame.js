/* Vanilla DOM adapter of huashu-design/assets/ios_frame.jsx.
   Preserves its supplied geometry and status-bar layout without a CDN dependency. */
(function(){
const iosFrameStyles = {
  wrapper: {
    display: 'inline-block',
    padding: 12,
    background: '#000',
    borderRadius: 60,
    boxShadow: '0 0 0 2px #1f2937, 0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  screen: {
    position: 'relative',
    borderRadius: 48,
    overflow: 'hidden',
    background: '#fff',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px 0 32px',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: '-apple-system, "SF Pro Text", sans-serif',
    zIndex: 20,
    pointerEvents: 'none',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 124,
    height: 36,
    background: '#000',
    borderRadius: 999,
    zIndex: 30,
  },
  statusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  signalIcon: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 12,
  },
  signalBar: {
    width: 3,
    background: 'currentColor',
    borderRadius: 1,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    position: 'relative',
  },
  batteryIcon: {
    width: 26,
    height: 12,
    border: '1.5px solid currentColor',
    borderRadius: 3,
    padding: 1,
    position: 'relative',
    opacity: 0.8,
  },
  batteryCap: {
    position: 'absolute',
    top: 3,
    right: -3,
    width: 2,
    height: 6,
    background: 'currentColor',
    borderRadius: '0 1px 1px 0',
  },
  content: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    bottom: 34,
    overflow: 'auto',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 140,
    height: 5,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    zIndex: 10,
  },
  homeIndicatorDark: {
    background: 'rgba(255,255,255,0.5)',
  },
};

function element(tag,style,text){const el=document.createElement(tag);for(const [key,value] of Object.entries(style||{}))el.style[key]=typeof value==='number'&&!['opacity','zIndex','fontWeight','flex','order','lineHeight'].includes(key)?value+'px':value;if(text!==undefined)el.textContent=text;return el;}
window.createIosFrame=function(mount){
 const wrapper=element('div',iosFrameStyles.wrapper);wrapper.className='ios-wrapper';
 const screen=element('div',{...iosFrameStyles.screen,width:'393px',height:'852px',background:'var(--bg)'});
 const bar=element('div',{...iosFrameStyles.statusBar,color:'#343c30'});bar.setAttribute('aria-hidden','true');
 bar.append(element('span',{},'9:41'));const icons=element('div',iosFrameStyles.statusIcons);const signal=element('div',iosFrameStyles.signalIcon);
 [4,6,9,11].forEach(height=>signal.append(element('div',{...iosFrameStyles.signalBar,height:height+'px'})));icons.append(signal);
 const wifi=element('span');wifi.innerHTML='<svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11.5a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/><path d="M3 7.5a7 7 0 0110 0M1 4.5a11 11 0 0114 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';icons.append(wifi);
 const battery=element('div',iosFrameStyles.batteryIcon);battery.append(element('div',{width:'85%',height:'100%',background:'currentColor',borderRadius:'1px',opacity:'.9'}),element('div',iosFrameStyles.batteryCap));icons.append(battery);bar.append(icons);
 const island=element('div',iosFrameStyles.dynamicIsland);island.setAttribute('aria-hidden','true');
 const content=element('div',{...iosFrameStyles.content,overflow:'hidden'});const app=element('div');app.id='phone-app';app.setAttribute('tabindex','-1');app.setAttribute('aria-label','Momo 默默互动原型');content.append(app);
 const home=element('div',iosFrameStyles.homeIndicator);home.setAttribute('aria-hidden','true');screen.append(bar,island,content,home);wrapper.append(screen);mount.append(wrapper);return app;
};})();
