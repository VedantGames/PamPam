import axios from 'axios';
import { useEffect, useState } from 'react';
import { Brush, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const baseURLS = ['http://localhost:8000/api/v1', 'https://pampam-server.vercel.app/api/v1'];

axios.defaults.baseURL = baseURLS[1];
axios.defaults.withCredentials = true;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const customValue = new Date(payload[0].payload.fulltime).toLocaleString(); // Example: doubling the value

    return (
      <div className='w-60 flex flex-col gap-2 text-[#bbb] shadow-md shadow-[#111]' style={{ backgroundColor: '#242424', padding: '10px', border: '1px solid #222' }}>
        <p>{customValue}</p>
        <div className='flex items-center justify-between gap-1 w-full'>
          <div className='flex items-center gap-1'>
            <div className='rounded-full size-3 bg-[#8884d8]'></div>
            <h1>Net Premium</h1>
          </div>
          <h1 className='text-white font-bold'>{payload[0].value}</h1>
        </div>
      </div>
    );
  }

  return null;
};

function App() {
  const [expiryData, setExpiryData] = useState([]);
  const [premiumsData, setPremiumsData] = useState([]);

  const [selectedExpiries, setSelectedExpiries] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [lastPrices, setLastPrices] = useState([]);
  
  const loadExpiriesData = () => {
    axios
      .get('/expiries/all')
      .then(({data}) => {
        setExpiryData(data.data.result);

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if ((hours > 9 || (hours === 9 && minutes >= 15)) && (hours < 15 || (hours === 15 && minutes <= 30)))
          setInterval(loadExpiriesData, 60000);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    loadExpiriesData();
  }, []);

  useEffect(() => {
    const mfunc = async () => {  
      if (expiryData.length > 6) {  
        const data = expiryData.map(index => axios.get('premiums/'+index.name+'/'+index.expiries[0]));
        const results = await Promise.all(data);
        console.log(results)
        var d = results.map(result => result.data.data.result);
        console.log(results, d)
            
        d = d.map(d => d.map(indD => {
          var time = new Date(indD.time).toLocaleTimeString().replace(' PM', '').replace(' AM', '');
          time = time.replace(time.slice(-3), '');
          return {...indD, time, fulltime: indD.time, straddle_price: Math.round(indD.straddle_price*100)/100} 
        }));
        setPremiumsData(d.map(d => d));
        setLastPrices(d.map(d => d[d.length-1]?.straddle_price || 0));
      }
    }
    mfunc()
  }, [expiryData]);

  return (
    <div className='grid grid-cols-3 mt-10 font-sans'>
      {(expiryData.length > 0 && premiumsData.length > 0) ? expiryData.map((index, i) => (
        <div key={index} className='w-full mb-5'>
          <div className='flex justify-center gap-5'>
            <h1 className='text-3xl'>{index.name}</h1>
            <select 
              value={new Date(index.expiries[selectedExpiries[i]]).toDateString()}
              onChange={ev => {
                setSelectedExpiries(selectedExpiries.map((selected, idx) => idx === i? ev.target.selectedIndex : selected));
              }}
            >
              {index.expiries.map((expiry, idx) => (
                <option key={idx} id={idx}>{new Date(expiry).toDateString()}</option> 
              ))}
            </select>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            {console.log(premiumsData[i])}
              <LineChart
                width={1000}
                height={3}
                data={premiumsData[i]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis interval={65} dataKey="time" />
                <YAxis orientation='right' domain={[]} dataKey="straddle_price"/>
                <Tooltip content={<CustomTooltip />} labelStyle={{color: '#000000'}} />
                <Line type="monotone" dataKey="straddle_price" stroke="#8884d8" activeDot={false} dot={false} />
                {console.log(lastPrices[i])}
                <ReferenceLine 
                  y={lastPrices[i]}//[selectedExpiries[i]]}
                  label={({ viewBox }) => {
                    const { x, y, width } = viewBox;
                    return (
                      <g className='border '>
                        <rect 
                          x={x + width + 5} 
                          y={y - 15} 
                          width={55} 
                          height={20} 
                          fill="#8884d8" 
                          stroke='#8884d8'
                          strokeWidth={2}
                          rx="3" 
                          ry="3" 
                        />
                        <text 
                          x={x + width + 30}
                          y={y - 3} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                        >
                          {lastPrices[i]}
                        </text>
                      </g>
                    );
                  }}
                  stroke="none"
                  yAxisId={0} 
                />
                <Brush fill='#242424' alwaysShowText />
              </LineChart>
            </ResponsiveContainer>
        </div>
      )) : (
        <div className='w-screen h-full flex justify-center'>
          <h1 className='text-5xl mt-10'>Loading...</h1>
        </div>
      )}
    </div>
  )
}

export default App
