import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DATE_FORMAT } from "./constants";

type UnitOfTime = "seconds" | "minutes" | "hours" | "days" | "months" | "years";

dayjs.extend(utc);
/**
 * @param date Input date string
 * @param format Valid date format
 * @returns Formatted date string
 */
const formatDate = (date: string, format?: string) => {
  return dayjs(date).format(format || DATE_FORMAT);
};

const diff = (fromDate: string, toDate: string, unitOfTime: UnitOfTime) => {
  return dayjs(fromDate).diff(dayjs(toDate), unitOfTime);
};

const add = (date: string, unit: number, unitOfTime: UnitOfTime) => {
  return dayjs(date).add(unit, unitOfTime);
};

const dateToUTC = (date: Date) => {
  return dayjs(date).utc(true).format();
};

export default {
  formatDate,
  diff,
  add,
  dateToUTC,
};
