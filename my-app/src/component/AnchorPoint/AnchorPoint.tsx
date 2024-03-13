import React from 'react';

const AnchorPoint = () => {
  const handleLinkClick = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <nav className="navbar">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a href="#section1" onClick={(e) => handleLinkClick(e, 'section1')}>
              Section 1
            </a>
          </li>
          <li className="nav-item">
            <a href="#section2" onClick={(e) => handleLinkClick(e, 'section2')}>
              Section 2
            </a>
          </li>
          <li className="nav-item">
            <a href="#section3" onClick={(e) => handleLinkClick(e, 'section3')}>
              Section 3
            </a>
          </li>
        </ul>
      </nav>

      <div className="content">
        <div id="section1" className="section">
          <h2>Section 1</h2>
          <p>Content of section 1</p>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>

        </div>
            
        <div id="section2" className="section">
          <h2>Section 2</h2>
          <p>Content of section 2</p>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
        <div id="section3" className="section">
          <h2>Section 3</h2>
          <p>Content of section 3</p>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
      </div>
    </div>
  );
};

export default AnchorPoint;