import { ChartData } from "@/src/chart/chartServices";
import { groupedByDateMock, registrosMock } from "../../chart/barChartFixture.test";
describe("Service", () => {
    let chartDataSUT = new ChartData(registrosMock);
    let chartData;

    beforeAll(() => {
        chartData = chartDataSUT.formatData();
    });

    it("Should group data by date", () => {
        expect(chartData.data).toMatchObject(groupedByDateMock)
    })

    it("Should sum values of months without salary", () => {
        const sum = chartData.sumValor();
        expect(sum[0].valor).toBe(60);
    });
})