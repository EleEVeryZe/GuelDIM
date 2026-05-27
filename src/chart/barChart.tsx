import { Slider, Stack, Typography } from "@mui/material";
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
import { ChartData } from "./chartServices";
import { RegistroUseCase } from "@/domain/usecases/RegistroUseCase";

type MonthRange = { de: number; ate: number };

function MonthRangePicker({ range, onChange }: { range: MonthRange; onChange: (next: MonthRange) => void }) {
  const handleSliderChange = (_event: Event, value: number | number[]) => {
    if (Array.isArray(value)) {
      onChange({ de: value[0], ate: value[1] });
    }
  };

  return (
    <Stack spacing={2} mb={2}>
      <Stack direction="row" spacing={4} alignItems="center">
        <Typography variant="body2" color="textSecondary">
          De: {range.de}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Até: {range.ate}
        </Typography>
      </Stack>
      <Slider
        value={[range.de, range.ate]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={0}
        max={12}
        step={1}
        marks
      />
    </Stack>
  );
}

export default function MyBarChart({ useCase, setFilteredMonth }: { useCase: RegistroUseCase, setFilteredMonth: any }) {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const chartService = useRef<ChartData | null>(null);
  const [range, setRange] = useState<MonthRange>({ de: 3, ate: 3 });

  const updateRange = (nextRange: MonthRange) => {
    setRange(nextRange);
    localStorage.setItem("grafico", JSON.stringify(nextRange));
  };

  useEffect(() => {
    chartService.current = new ChartData(useCase);
    const currentRange = JSON.parse(localStorage.getItem("grafico") || "{}");
    const initialRange = {
      de: Number(currentRange?.de) || 3,
      ate: Number(currentRange?.ate) || 3,
    };
    setRange(initialRange);
    setProcessedData(
      chartService.current.setMonthRange(initialRange.de, initialRange.ate).formatData().sumValor()
    );
  }, [useCase]);

  useEffect(() => {
      if (!chartService.current) return;
      setProcessedData(
        chartService.current.setMonthRange(range.de, range.ate).formatData().sumValor()
      );
  }, [useCase, range.de, range.ate]);

  return (
    <>
      <MonthRangePicker
        range={range}
        onChange={updateRange}
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
