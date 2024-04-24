﻿import {ConstantHelper, test} from '@umbraco/playwright-testhelpers';
import {expect} from '@playwright/test';

test.describe('Document Type Folder tests', () => {
  const documentFolderName = 'TestFolder';

  test.beforeEach(async ({umbracoUi, umbracoApi}) => {
    await umbracoApi.documentType.ensureNameNotExists(documentFolderName);
    await umbracoUi.goToBackOffice();
  });

  test.afterEach(async ({umbracoApi}) => {
    await umbracoApi.documentType.ensureNameNotExists(documentFolderName);
  });

  test('can create a empty document type folder', async ({umbracoApi, umbracoUi}) => {
    // Act
    await umbracoUi.documentType.goToSection(ConstantHelper.sections.settings);
    await umbracoUi.documentType.clickActionsMenuForName('Document Types');
    await umbracoUi.documentType.clickCreateButton();
    await umbracoUi.documentType.clickCreateDocumentFolderButton();
    await umbracoUi.documentType.enterFolderName(documentFolderName);
    await umbracoUi.documentType.clickCreateFolderButton();

    // Assert
    await umbracoUi.documentType.isSuccessNotificationVisible();
    const folder = await umbracoApi.documentType.getByName(documentFolderName);
    expect(folder.name).toBe(documentFolderName);
    // Checks if the folder is in the root
    await umbracoUi.documentType.isDocumentTreeItemVisible(documentFolderName);
  });

  test('can delete a document type folder', async ({umbracoApi, umbracoUi}) => {
    // Arrange
    await umbracoApi.documentType.createFolder(documentFolderName);

    // Act
    await umbracoUi.documentType.goToSection(ConstantHelper.sections.settings);
    await umbracoUi.documentType.clickRootFolderCaretButton();
    await umbracoUi.documentType.clickActionsMenuForName(documentFolderName);
    await umbracoUi.documentType.deleteFolder();

    // Assert
    await umbracoUi.documentType.isSuccessNotificationVisible();
    await umbracoApi.documentType.doesNameExist(documentFolderName);
    await umbracoUi.documentType.isDocumentTreeItemVisible(documentFolderName, false);
  });

  test('can rename a document type folder', async ({umbracoApi, umbracoUi}) => {
    // Arrange
    const oldFolderName = 'OldName';
    await umbracoApi.documentType.createFolder(oldFolderName);

    // Act
    await umbracoUi.documentType.goToSection(ConstantHelper.sections.settings);
    await umbracoUi.documentType.clickRootFolderCaretButton();
    await umbracoUi.documentType.clickActionsMenuForName(oldFolderName);
    await umbracoUi.documentType.clickRenameFolderButton();
    await umbracoUi.documentType.enterFolderName(documentFolderName);
    await umbracoUi.documentType.clickUpdateFolderButton();

    // Assert
    await umbracoUi.documentType.isSuccessNotificationVisible();
    const folder = await umbracoApi.documentType.getByName(documentFolderName);
    expect(folder.name).toBe(documentFolderName);
    await umbracoUi.documentType.isDocumentTreeItemVisible(oldFolderName, false);
    await umbracoUi.documentType.isDocumentTreeItemVisible(documentFolderName);
  });


  // Currently it is not possible to create a folder in a folder
  test('can create a document type folder in a folder', async ({umbracoApi, umbracoUi}) => {
    // Arrange
    const childFolderName = 'ChildFolder';
    await umbracoApi.documentType.ensureNameNotExists(childFolderName);
    const parentFolderId = await umbracoApi.documentType.createFolder(documentFolderName);

    // Act
    await umbracoUi.documentType.goToSection(ConstantHelper.sections.settings);
    await umbracoUi.documentType.clickRootFolderCaretButton();
    await umbracoUi.documentType.clickActionsMenuForName(documentFolderName);
    await umbracoUi.documentType.clickCreateButton();
    await umbracoUi.documentType.clickCreateDocumentFolderButton();
    await umbracoUi.documentType.enterFolderName(childFolderName);
    await umbracoUi.documentType.clickCreateFolderButton();

    // Assert
    await umbracoUi.documentType.isSuccessNotificationVisible();
    const folder = await umbracoApi.documentType.getByName(childFolderName);
    expect(folder.name).toBe(childFolderName);
    // Checks if the parentFolder contains the ChildFolder as a child
    const parentFolder = await umbracoApi.documentType.getChildren(parentFolderId);
    expect(parentFolder[0].name).toBe(childFolderName);

    // Clean
    await umbracoApi.documentType.ensureNameNotExists(childFolderName);
  });
});
