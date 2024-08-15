import dayjs from 'dayjs';
type UnitOfTime = "seconds" | "minutes" | "hours" | "days" | "months" | "years";
/**
 *
 * @param date Input date string
 * @param format Valid date format
 * @returns Formatted date string
 */
const formatDate = (date: string, format?: string) => {
  return dayjs(date).format(format || "YYYY-MM-DD");
};

const diff = (fromDate: string, toDate: string, unitOfTime: UnitOfTime) => {
  return dayjs(fromDate).diff(dayjs(toDate), unitOfTime);
};

const add = (date: string, unit: number, unitOfTime: UnitOfTime) => {
  return dayjs(date).add(unit, unitOfTime);
};

export default {
  formatDate,
  diff,
  add,
};
