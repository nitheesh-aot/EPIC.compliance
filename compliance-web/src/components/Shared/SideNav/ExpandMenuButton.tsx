import { useMenuStore } from "@/store/menuStore";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Button } from "@mui/material";

export default function ExpandMenuButton() {
  const { expandMenu, toggleExpandMenu } = useMenuStore();

  return (
    <Button
      sx={{
        height: "3rem",
        width: "2rem",
        padding: "0.75rem 0.5rem",
        minWidth: "auto",
        marginLeft: "2px",
        marginRight: "14px",
        borderRadius: "0px 0.25rem 0.25rem 0",
      }}
      color="primary"
      onClick={toggleExpandMenu}
    >
      {expandMenu ? (
        <ChevronLeft fontSize={"large"} />
      ) : (
        <ChevronRight fontSize={"large"} />
      )}
    </Button>
  );
}
