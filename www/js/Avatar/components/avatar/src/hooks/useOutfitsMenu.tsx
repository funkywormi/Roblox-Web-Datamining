import React, { useCallback, useState } from "react";
import { OutfitOption } from "../types";
import { CatalogOutfitItem } from "../avatar.types";

const useOutfitsMenu = (): {
  activeItem: CatalogOutfitItem | null;
  onItemMenuButtonClicked: (
    event: React.MouseEvent,
    item: CatalogOutfitItem,
    option: OutfitOption,
  ) => void;
  openOutfitMenu: (item: CatalogOutfitItem) => void;
  closeOutfitMenu: () => void;
  //
  outfitToUpdate: CatalogOutfitItem | null;
  closeUpdateOutfitDialog: () => void;
  //
  outfitToDelete: CatalogOutfitItem | null;
  closeDeleteOutfitDialog: () => void;
  //
  outfitToRename: CatalogOutfitItem | null;
  closeRenameOutfitDialog: () => void;
  //
  createOutfitIsOpen: boolean;
  setCreateOutfitIsOpen: (isOpen: boolean) => void;
} => {
  const [activeItem, setActiveItem] = useState<CatalogOutfitItem | null>(null);
  const [outfitToUpdate, setOutfitToUpdate] = useState<CatalogOutfitItem | null>(null);
  const [outfitToDelete, setOutfitToDelete] = useState<CatalogOutfitItem | null>(null);
  const [outfitToRename, setOutfitToRename] = useState<CatalogOutfitItem | null>(null);
  const [createOutfitIsOpen, setCreateOutfitIsOpen] = useState<boolean>(false);

  const openRenameOutfitModal = useCallback((item: CatalogOutfitItem) => {
    setOutfitToRename(item);
  }, []);

  const closeRenameOutfitDialog = useCallback(() => {
    setOutfitToRename(null);
  }, []);

  const openDeleteOutfitModal = useCallback((item: CatalogOutfitItem) => {
    setOutfitToDelete(item);
  }, []);

  const closeDeleteOutfitDialog = useCallback(() => {
    setOutfitToDelete(null);
  }, []);

  const openUpdateOutfitModal = useCallback((item: CatalogOutfitItem) => {
    setOutfitToUpdate(item);
  }, []);

  const closeUpdateOutfitDialog = useCallback(() => {
    setOutfitToUpdate(null);
  }, []);

  const openOutfitMenu = useCallback((item: CatalogOutfitItem) => {
    setActiveItem(item);
  }, []);

  const closeOutfitMenu = useCallback(() => {
    setActiveItem(null);
  }, []);

  const onItemMenuButtonClicked = useCallback(
    ($event, item: CatalogOutfitItem, option: OutfitOption) => {
      setActiveItem(null);

      if (option.name === "Delete") {
        openDeleteOutfitModal(item);
      } else if (option.name === "Update") {
        openUpdateOutfitModal(item);
      } else if (option.name === "Rename") {
        openRenameOutfitModal(item);
      } else if (option.name === "Cancel") {
        closeOutfitMenu();
      } else {
        console.error("Unknown outfit menu option:", option);
      }
    },
    [closeOutfitMenu, openDeleteOutfitModal, openRenameOutfitModal, openUpdateOutfitModal],
  );

  return {
    activeItem,
    onItemMenuButtonClicked,
    openOutfitMenu,
    closeOutfitMenu,

    outfitToUpdate,
    closeUpdateOutfitDialog,

    outfitToDelete,
    closeDeleteOutfitDialog,

    outfitToRename,
    closeRenameOutfitDialog,

    createOutfitIsOpen,
    setCreateOutfitIsOpen,
  };
};

export default useOutfitsMenu;
