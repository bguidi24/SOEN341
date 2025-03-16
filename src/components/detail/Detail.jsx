import "./detail.css"

const Detail = () => {
    return (
      <div className='detail'>
        <div className="user">
          <img src="./avatar.png" alt="" />
          <h2>
            Jane Doe
          </h2>
          <p>
            Description
          </p>
        </div>
        <div className="info">
          <div className="option">
            <div className="title">
              <span>
                Privacy % Help
              </span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>
                Chat Settings
              </span>
              <img src="./arrowUp.png" alt="" />
            </div>     
          </div>
          <button>
            Block User
          </button>
          <button className="logout">Logout
          
          </button>
        </div>
      </div>
    )
  }

  export default Detail