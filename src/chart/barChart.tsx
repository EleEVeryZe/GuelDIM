import { TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Registro } from "../interfaces/interfaces";
import { ChartData } from "./chartServices";

export default function MyBarChart({ data, setFilteredMonth }: { data: Registro[], setFilteredMonth: any }) {
  const [processedData, setProcessedData] = useState();
  const chartService = useRef(null);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  
  useEffect(() => {
    chartService.current = new ChartData(data);
    const currentRange =  JSON.parse(localStorage.getItem("grafico"));
    setDe(currentRange?.de.length ? currentRange?.de : 3);
    setAte(currentRange?.ate.length ? currentRange?.ate : 3);
  }, [data]);

  useEffect(() => {
    setProcessedData(
      chartService.current.setMonthRange(de.length ? de : 3, ate.length ? ate : 3).formatData().sumValor()
    );
  }, [de, ate, data]);

  return (
    <>
      <TextField
        id="outlined-basic"
        label="De"
        className="full-width flex-2"
        variant="outlined"
        value={de}
        type="number"
        onChange={(e) => {
          setDe(e.target.value)
          localStorage.setItem("grafico", JSON.stringify({de: e.target.value, ate}));
        }}
      />

      <TextField
        id="outlined-basic"
        label="Ate"
        value={ate}
        className="full-width flex-2"
        variant="outlined"
        type="number"
        onChange={(e) => {
          setAte(e.target.value);
          localStorage.setItem("grafico", JSON.stringify({de, ate: e.target.value}));
        }}
      />
      <ResponsiveContainer width={"100%"} height={300}>
        <BarChart
          data={processedData}
          onClick={(barChartClickData) => {
            const actvLabel = barChartClickData.activeLabel;
            setFilteredMonth(parseInt(barChartClickData.activeLabel.substring(actvLabel.length -2, actvLabel.length)) + "")
          }}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="descricao" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="valor"
            fill="#B3CDAD"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="valorMenosInvestimento"
            fill="#B3CDAD"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="acumulado"
            fill="#5059c9"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
