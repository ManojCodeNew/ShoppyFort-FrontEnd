import '../styles/components/add.scss';
export default function Add({title,desc,bgcolor}) {
    return (
        <div className='add-container' style={{backgroundColor:bgcolor}}>
            <h5>{title}</h5>
            <marquee  direction="left">
             <p>{desc}</p>
             </marquee>  {/* <img src={add} alt="advertisement" /> */}
        </div>
    )
}
