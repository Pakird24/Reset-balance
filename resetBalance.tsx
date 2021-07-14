import React, { useEffect, } from "react";
import { makeStyles, Theme, } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Grid, } from "@material-ui/core";
import { useDispatch, useSelector, } from "react-redux";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';

import ProgressHOC from '../../../../components/ProgressHOC';

import { actions, } from './effects/actions';
import SessionTable from './components/sessionTable/SessionsTable';
import SessionTableRow from './components/sessionTable/TableRow';
import ConfirmModal from './components/ConfirmModal';
import { Row, } from './resetBalanceTypes';

interface StyledTabProps {
  label: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  container: { margin: "0 auto", },
  grid: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '1%',
  },
  card: { minWidth: 275, } ,
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  padding: { padding: theme.spacing(3), },
  title: { fontSize: 14, },
  notFound: {
    fontSize: 24,
    textAlign: 'center',
  },
  pos: { marginBottom: 12, },
  table: { minWidth: 650, },
  marginGrid:
    { marginTop: '2%', },

}));

interface RouteComponentPosition {
  [key: string]: number;
}

export default React.memo((props: Props) => {
  const { match: { params: { tutorId, }, }, } = props;
  const classes = useStyles({});
  const dispatch = useDispatch();

  const {
        resetBalance: {
          payed,
          unpayed,
          totalPayed,
          totalUnpayed,
          status,
          loaded,
          activeTab,
          tutorInfo: {
            tutor,
            commissionSize,
            paymentComment,
            countryId,
          },
      },
    systemInfo,
  } = useSelector((state: GlobalStore) => ({
    resetBalance: state.resetBalance,
    systemInfo: state.systemInfo,
  }));

  const handleChangeActiveTab = (event: React.ChangeEvent<{}>, newValue: string) => {
    dispatch(actions.changeResetInformationActiveTab(newValue));
  };

  useEffect(() => {
    dispatch(actions.getResetInformation(Number(tutorId)));

    return () => {
      dispatch(actions.clearResetInformation());
    }
  }, []);

  if (!countryId) return null;

  if (status === 404) {
   return (
     <Typography className={classes.notFound} color="textSecondary" gutterBottom>
          404 Not found tutor!
     </Typography>
    );
   }

  if (countryId !== systemInfo.selectedCountry.id) {
   return (
     <Typography className={classes.notFound} color="textSecondary" gutterBottom>
        Tutor relates to another country!
     </Typography>
    );
   }
  const { currency = null, } = systemInfo.countries.find((_: Country) => _.id === countryId) || {};
  const isClear = (loaded && activeTab === 'payed' && !payed.length) ||
                  (loaded && activeTab === 'unpayed' && !unpayed.length);
   const isPayedTab = activeTab === 'payed';
   return (
     <Paper className={classes.root}>
       <ConfirmModal />
       <Grid container className={classes.grid}>
         <Card className={`${classes.card} ${classes.marginGrid}`}>
           <CardContent>
             <Typography className={classes.title} color="textSecondary" gutterBottom>
              Tutor name
             </Typography>
             <ProgressHOC flag={loaded}>
               <Typography variant="h5" component="h2">
                 {tutor}
               </Typography>
             </ProgressHOC>
             <Typography className={classes.pos} color="textSecondary">
              3uloom commission
             </Typography>
             <ProgressHOC flag={commissionSize !== null}>
               <Typography variant="body2" component="p">
                 {commissionSize}
              %
               </Typography>
             </ProgressHOC>
           </CardContent>
         </Card>
         <Card className={`${classes.card} ${classes.marginGrid}`}>
           <CardContent>
             <Typography
               className={classes.title}
               color="textSecondary"
               gutterBottom
             >
              You own to tutor
             </Typography>
             <Typography variant="h5" component="h2" />
             <ProgressHOC flag={loaded}>
               <Typography variant="body2" component="p">
                 {totalPayed.weOwnTutor.toFixed(2)}
                 {' '}
                 { currency && currency.currencyCode }
               </Typography>
             </ProgressHOC>
           </CardContent>
           <CardActions>
             <Button
               variant="outlined"
               color="primary"
               disabled={!payed.length}
               onClick={() =>
              dispatch(actions.changeResetInformationConfirmationModal(true))}
             >
                Reset the balance!
             </Button>
           </CardActions>
         </Card>
         <Card className={`${classes.card} ${classes.marginGrid}`}>
           <CardContent>
             <Typography
               className={classes.title}
               color="textSecondary"
               gutterBottom
             >
              Comment for tutor
             </Typography>
             <TextField
               id="standard-multiline-flexible"
               multiline
               rowsMax="4"
               value={paymentComment}
               onChange={(e) =>
                dispatch(actions.changeResetInformationCommentForTutor(e.target.value))}
             />
           </CardContent>
           <CardActions>
             <Button
               size="small"
               onClick={() =>
                dispatch(
                  actions.handleSendResetInformationPaymentComment(
                    { paymentComment, tutorId: Number(tutorId), }
                  )
                )}
             >
               Send
             </Button>
           </CardActions>
         </Card>
       </Grid>
       <Grid className={classes.marginGrid}>
         <AppBar position="static">
           <Tabs value={activeTab} onChange={(handleChangeActiveTab)}>
             <Tab label="Paid" value='payed' />
             <Tab label="Unpaid" value='unpayed' />
           </Tabs>
         </AppBar>
       </Grid>
       <Grid>
         { isClear ?
          (
            <Typography className={classes.notFound} color="textSecondary" gutterBottom>
            Clear
            </Typography>
            )
            :
          (
            <ProgressHOC flag={loaded}>
              <SessionTable
                className={classes.table}
                isPayedTab={isPayedTab}
                currencyCode={systemInfo.selectedCountry.currency.currencyCode}
              >
                {(isPayedTab
                ? payed :
                unpayed).map(
                  (row: Row) => (
                    <SessionTableRow
                      key={row.sessionId}
                      row={row}
                      isPayedTab={isPayedTab}
                    />
                ))
                }
                <SessionTableRow
                  row={isPayedTab
                        ? totalPayed :
                        totalUnpayed
                  }
                  isPayedTab={isPayedTab}
                  total
                />
              </SessionTable>
            </ProgressHOC>
          )}
       </Grid>
     </Paper>
  )
});