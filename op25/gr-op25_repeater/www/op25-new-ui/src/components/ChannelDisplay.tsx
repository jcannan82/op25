import { useState } from "react";
import { useAppSelector } from "redux/app/hooks";
import { selectChannel, selectStepSizes } from "redux/slices/op25/op25Slice";
import { frequencyToString, OP25 } from "lib/op25";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { selectIsDarkMode } from "redux/slices/preferences/preferencesSlice";

import {
  Card,
  CardActions,
  CardContent,
  Button,
  Theme,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  CardHeader,
  createStyles,
  makeStyles,
} from "@material-ui/core";

import {
  FiChevronsLeft as DoubleArrowsLeftIcon,
  FiChevronLeft as ArrowLeftIcon,
  FiChevronsRight as DoubleArrowsRightIcon,
  FiChevronRight as ArrowRightIcon,
  FiMinimize2 as MinimizeIcon,
  FiMaximize2 as MaximizeIcon,
} from "react-icons/fi";

type ChannelDisplayProps = {
  className?: string | undefined;
  channelId: number;
};

type useStylesProps = {
  isEncrypted: boolean;
  isDarkMode: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
      border: "0",
    },
    cardContent: {
      paddingRight: 15,
      borderLeftStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderRightStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderWidth: 1,
    },
    cardHeader: {
      backgroundColor: (props: useStylesProps) =>
        props.isEncrypted ? "red" : theme.palette.primary.main,
      borderLeftStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderRightStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderTopStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderWidth: 1,
      borderColor: (props: useStylesProps) =>
        props.isEncrypted ? "red" : theme.palette.primary.main,
      margin: "0",
      textAlign: "center",
      height: 30,
      color: theme.palette.primary.contrastText,
    },
    cardHeaderActions: {
      display: "block",
      marginTop: -15,
    },
    currentchannel: {
      marginLeft: 15,
      marginBottom: 20,
      overflow: "auto",
    },
    grid: {
      height: 260,
    },
    gridRoot: {
      fontSize: 12,
      border: "0",
    },
    rowRoot: {
      border: "0",
    },
    cellRoot: {
      paddingLeft: 5,
      paddingRight: 5,
      border: "0",
    },
    cardActions: {
      paddingBottom: 20,
      borderLeftStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderRightStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderBottomStyle: (props: useStylesProps) =>
        props.isDarkMode ? "none" : "solid",
      borderWidth: 1,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    actionbuttons: {
      paddingLeft: 15,
      paddingRight: 15,
    },
  })
);

const ChannelDisplay = ({ className, channelId }: ChannelDisplayProps) => {
  const op25 = OP25.getInstance();
  const channel = useAppSelector(selectChannel(channelId));
  const isDarkMode = useAppSelector(selectIsDarkMode);
  const { stepSizeSmall, stepSizeLarge } = useAppSelector(selectStepSizes);
  const [minimized, setMinimized] = useState(false);
  const classes = useStyles({
    isEncrypted: channel ? channel.encrypted : false,
    isDarkMode,
  });

  const columns: GridColDef[] = [
    { field: "id", hide: true, sortable: false, width: 0 },
    {
      field: "stateName",
      align: "right",
      sortable: false,
      width: 110,
      renderHeader: (_) => <></>,
      renderCell: (params: GridRenderCellParams) =>
        params.getValue(params.id, "description") ? (
          <Tooltip
            title={`${
              params.getValue(params.id, "description") &&
              params.getValue(params.id, "description")?.toString()
            }`}
            enterDelay={500}
            placement="right"
          >
            <span>{params.getValue(params.id, "stateName")}</span>
          </Tooltip>
        ) : (
          <span>{params.getValue(params.id, "stateName")}</span>
        ),
    },
    {
      field: "stateValue",
      align: "left",
      sortable: false,
      renderHeader: (_) => <></>,
      renderCell: (params: GridRenderCellParams) =>
        params.getValue(params.id, "stateName") === "System Name:" ? (
          <Tooltip
            title={`${
              params.getValue(params.id, "stateValue") &&
              params.getValue(params.id, "stateValue")?.toString()
            }`}
            enterDelay={500}
            placement="right"
          >
            <span>{params.getValue(params.id, "stateValue")}</span>
          </Tooltip>
        ) : (
          <span>{params.getValue(params.id, "stateValue")}</span>
        ),
    },
    { field: "description", hide: true, sortable: false },
  ];

  const rows = [
    {
      id: 1,
      stateName: "Group Address:",
      stateValue: channel && channel.tgID ? channel.tgID : "-",
      description:
        "Also known as the Talkgroup ID, this is the unique ID assigned to a group.",
    },
    {
      id: 2,
      stateName: "Source Address:",
      stateValue:
        channel && channel.sourceAddress ? channel.sourceAddress : "-",
      description: "ID of the person talking (Radio ID / Unit ID)",
    },
    {
      id: 3,
      stateName: "Frequency:",
      stateValue:
        channel && channel.frequency
          ? frequencyToString(channel.frequency)
          : "-",
    },
    {
      id: 4,
      stateName: "Encrypted:",
      stateValue: channel ? (channel.encrypted ? "Yes" : "No") : "-",
      description:
        "Shows as yes if this channel is encrpyted (false positives do occur)",
    },
    {
      id: 5,
      stateName: "System Name:",
      stateValue: channel ? channel.systemName : "-",
      nextFunction: () => {},
    },
  ];

  const getCardHeaderText = (): string => {
    if (minimized) {
      if (channel) {
        return channel.name || channel.tgTag || channel.tgID
          ? `${channel.name ? `${channel.name} / ` : ""}${
              channel.tgTag || channel.tgID
                ? channel.tgTag
                  ? channel.tgTag
                  : channel.tgID
                : channel.name
                ? "-"
                : ""
            }`
          : "-";
      } else {
        return "-";
      }
    } else {
      return channel ? (channel.name ? channel.name : "-") : "-";
    }
  };

  // TODO: Create better prompt.
  const onGoToTalkgroup = async () => {
    if (channel) {
      const talkgroupId = prompt("Hold on what talkgroup ID?");
      if (talkgroupId) {
        await op25.sendHoldOnChannel(channel.id, Number.parseInt(talkgroupId));
      }
    }
  };

  const onHoldTalkgroup = async () => {
    if (channel && channel.tgID) {
      await op25.sendHoldOnChannel(channel.id, channel.tgID);
    }
  };

  const onReloadChannel = async () => {
    if (channel) {
      await op25.sendReloadOnChannel(channel.id);
    }
  };

  // TODO: Create better prompt.
  const onBlacklistTalkgroup = async () => {
    if (channel) {
      const talkgroupId = prompt(
        "Blacklist what talkgroup ID?",
        channel.tgID?.toString()
      );
      if (talkgroupId) {
        await op25.sendBlacklistOnChannel(
          channel.id,
          Number.parseInt(talkgroupId)
        );
      }
    }
  };

  // TODO: Create better prompt.
  const onWhitelistTalkgroup = async () => {
    if (channel) {
      const talkgroupId = prompt(
        "Whitelist what talkgroup ID?",
        channel.tgID?.toString()
      );
      if (talkgroupId) {
        await op25.sendWhitelistOnChannel(
          channel.id,
          Number.parseInt(talkgroupId)
        );
      }
    }
  };

  // TODO: Create better prompt.
  const onLogVerboseChange = async () => {
    if (channel) {
      const verboseLevel = prompt("What log verbose level?");
      if (verboseLevel) {
        await op25.sendSetDebugOnChannel(
          channel.id,
          Number.parseInt(verboseLevel)
        );
      }
    }
  };

  const toggleMinimized = () => {
    setMinimized(!minimized);
  };

  const onSkipTalkgroup = async () => {
    if (channel) {
      await op25.sendSkipOnChannel(channel.id);
    }
  };

  return (
    <Card
      className={`${classes.root}${
        className !== undefined ? ` ${className}` : ""
      }`}
      variant="outlined"
    >
      <CardHeader
        title={getCardHeaderText()}
        action={
          <span className={classes.cardHeaderActions}>
            <IconButton onClick={toggleMinimized}>
              {minimized ? <MaximizeIcon /> : <MinimizeIcon />}
            </IconButton>
          </span>
        }
        className={classes.cardHeader}
        titleTypographyProps={{ variant: "subtitle2" }}
      />
      {!minimized && (
        <>
          <CardContent className={classes.cardContent}>
            <Typography
              className={classes.currentchannel}
              variant="h5"
              component="h2"
            >
              {channel && (channel.tgTag || channel.tgID)
                ? channel.tgTag
                  ? channel.tgTag
                  : channel.tgID
                : "-"}
            </Typography>
            <div className={classes.grid}>
              <DataGrid
                classes={{
                  root: classes.gridRoot,
                  row: classes.rowRoot,
                  cell: classes.cellRoot,
                }}
                rows={rows}
                columns={columns}
                headerHeight={0}
                isRowSelectable={(_) => false}
                hideFooter
              />
            </div>
          </CardContent>
          <CardActions className={classes.cardActions}>
            {!minimized && (
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Grid container direction="row" justifyContent="center">
                    <Button size="small" onClick={onSkipTalkgroup}>
                      Skip
                    </Button>
                    <Button size="small" onClick={onHoldTalkgroup}>
                      Hold
                    </Button>
                    <Button size="small" onClick={onReloadChannel}>
                      Reload
                    </Button>
                    <Button size="small" onClick={onGoToTalkgroup}>
                      GOTO
                    </Button>
                    <Tooltip
                      title="Blacklist"
                      placement="top"
                      enterDelay={500}
                      onClick={onBlacklistTalkgroup}
                    >
                      <Button size="small">B/List</Button>
                    </Tooltip>
                    <Tooltip
                      title="Whitelist"
                      placement="top"
                      enterDelay={500}
                      onClick={onWhitelistTalkgroup}
                    >
                      <Button size="small">W/List</Button>
                    </Tooltip>
                    <Tooltip
                      title="Log Verbosity"
                      placement="top"
                      enterDelay={500}
                      onClick={onLogVerboseChange}
                    >
                      <Button size="small">Log/V</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" justifyContent="center">
                    <Tooltip title={`-${stepSizeLarge}`} placement="top">
                      <IconButton
                        size="small"
                        className={classes.actionbuttons}
                      >
                        <DoubleArrowsLeftIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`-${stepSizeSmall}`} placement="top">
                      <IconButton
                        size="small"
                        className={classes.actionbuttons}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`+${stepSizeSmall}`} placement="top">
                      <IconButton
                        size="small"
                        className={classes.actionbuttons}
                      >
                        <ArrowRightIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`+${stepSizeLarge}`} placement="top">
                      <IconButton
                        size="small"
                        className={classes.actionbuttons}
                      >
                        <DoubleArrowsRightIcon />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" onClick={onGoToTalkgroup}>
                      View Plot
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default ChannelDisplay;
