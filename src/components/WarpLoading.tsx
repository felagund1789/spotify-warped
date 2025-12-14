import '../styles/WarpLoading.css';

export default function WarpLoading() {
  return (
    <div className="warp-loading">
      <div className="warp-tunnel">
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
        <div className="warp-line"></div>
      </div>
      <div className="loading-text">
        <span>W</span><span>A</span><span>R</span><span>P</span><span>I</span><span>N</span><span>G</span>
        <div className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  );
}