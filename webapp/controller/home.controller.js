sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"

],
    function (Controller, JSONModel, Fragment, MessageToast, Filter, FilterOperator, MessageBox) {
        "use strict";

        return Controller.extend("com.app.odataservice.controller.home", {
            onInit: function () {

            },
            onCreate: async function () {

                const swhn = this.getView().byId("idWHNidInput12").getValue();
                const sstoragebin = this.getView().byId("idStorageBinInput12").getValue();
                const sstoragetype = this.getView().byId("idStoragetypeInput12").getValue();
                const sresponse = this.getView().byId("idresponseInput12").getValue();
                const serror = this.getView().byId("iderrorInput12").getValue();

                const olocalModel = new JSONModel({

                    WarehouseNo: swhn,
                    StorageBin: sstoragebin,
                    StorageType: sstoragetype,
                    Response: sresponse,
                    ErrorCode: serror

                });
                this.getView().setModel(olocalModel, "localModel");
                const oPayload = this.getView().getModel("localModel").getProperty("/");
                const oModel = this.getView().getModel();

                const oIdExist = await this.checkID(oModel, parseInt(this.byId("idWHNidInput12").getValue()))
                if (oIdExist) {
               
                    MessageToast.show("Warehouse Number already exsist")
                    return}

                try {
                    // Assuming createData method sends a POST request
                    await this.createData(oModel, oPayload, "/Sample_serviceSet");
                    MessageToast.show("created sucessfully");

                    this.oCreateDialog.close();


                } catch (error) {
                    console.error("Error:", error);
                }

            },
            checkID: async function (oModel, st) {
                return new Promise((resolve, reject) => {
                    oModel.read("/Sample_serviceSet", {
                        filters: [
                            new Filter("WarehouseNo", FilterOperator.EQ, st),
                           
     
                        ],
                        success: function (oData) {
                            resolve(oData.results.length > 0);
                        },
                        error: function () {
                            reject(
                                "An error occurred while checking username existence."
                            );
                        }
                    })
                })
            },
            onCreateDailog: async function () {
                if (!this.oCreateDialog) {
                    this.oCreateDialog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.odataservice.fragments.create",
                        controller: this
                    });
                    this.getView().addDependent(this.oCreateDialog);
                }

                this.oCreateDialog.open();
            },

            onCloseDialog: function () {
                if (this.oCreateDialog.isOpen()) {
                    this.oCreateDialog.close()
                }
            },
            createData: function (oModel, oPayload, sPath) {
                return new Promise((resolve, reject) => {
                    oModel.create(sPath, oPayload, {
                        refreshAfterChange: true,
                        success: function (oSuccessData) {
                            resolve(oSuccessData);
                        },
                        error: function (oErrorData) {
                            reject(oErrorData)
                        }
                    })
                })
            },
            // onEdit: function () {
            //     var oTable = this.byId("idTable");
            //     var aSelectedItems = oTable.getSelectedItems();

            //     if (aSelectedItems.length === 0) {
            //         sap.m.MessageToast.show("Please select an item to edit.");
            //         return;
            //     }

            //     aSelectedItems.forEach(function (oItem) {
            //         var aCells = oItem.getCells();
            //         aCells.forEach(function (oCell) {
            //             var aVBoxItems = oCell.getItems();
            //             aVBoxItems[0].setVisible(false); // Hide Text
            //             aVBoxItems[1].setVisible(true); // Show Input
            //         });
            //     });
            //     this.byId("editButton").setVisible(false);
            //     this.byId("saveButton").setVisible(true);
            //     this.byId("cancelButton").setVisible(true);
            // },
            // onCancel: function () {
            //     var oTable = this.byId("idTable");
            //     var aSelectedItems = oTable.getSelectedItems();

            //     aSelectedItems.forEach(function (oItem) {
            //         var aCells = oItem.getCells();
            //         aCells.forEach(function (oCell) {
            //             var aVBoxItems = oCell.getItems();
            //             aVBoxItems[0].setVisible(true); // Show Text
            //             aVBoxItems[1].setVisible(false); // Hide Input
            //         });
            //     });

            //     this.byId("editButton").setVisible(true);
            //     this.byId("saveButton").setVisible(false);
            //     this.byId("cancelButton").setVisible(false);
            // },

            onEdit: function (oEvent) {
                const oedit = this.byId("idTable").getSelectedItem();
                if (oEvent.getSource().getText() === 'Edit') {
                    oEvent.getSource().setText("Sumbit")
                    oedit.getCells()[2].setEditable(true);
                    oedit.getCells()[1].setEditable(true);
                    oedit.getCells()[3].setEditable(true);
                    oedit.getCells()[4].setEditable(true);
                } else {
                    oEvent.getSource().setText("Edit");
                    oedit.getCells()[2].setEditable(false);
                    oedit.getCells()[1].setEditable(false);
                    oedit.getCells()[3].setEditable(false);
                    oedit.getCells()[4].setEditable(false);

                    var sPath = this.byId("idTable").getSelectedItem().getBindingContext().getPath();
                    var a = this.byId("idTable").getSelectedItem().getCells()[1].getValue();
                    var b = this.byId("idTable").getSelectedItem().getCells()[2].getValue();
                    var c = this.byId("idTable").getSelectedItem().getCells()[3].getValue();
                    var d = this.byId("idTable").getSelectedItem().getCells()[4].getValue();
                    var oModel = this.getView().getModel();
                    var that = this;
                    oModel.update(sPath, { StorageBin: a, StorageType: b, Response: c, ErrorCode: d }, {
                        success: function (odata) {
                            that.byId("idTable").getBinding("items").refresh(true);
                            oModel.refresh(true);
                            MessageBox.success("Successfully updated!!");
                        }, error: function (oError) {
                            MessageBox.error("Not Updated!!!")

                        }
                    })
                }
            },
            onDelete: function () {
                var osel = this.getView().byId("idTable").getSelectedItems();
                if (osel && osel.length > 0) {
                    osel.forEach(function (oSelectedItem) {
                        var sPath = oSelectedItem.getBindingContext().getPath();
                        var oModel = oSelectedItem.getModel();
                        oModel.remove(sPath, {
                            success: function (odata) {
                                console.log("Item deleted successfully.");
                            },
                            error: function (oError) {
                                console.error("Error deleting item:", oError);
                            }

                        });

                    });
                }
            },
        });
    });
